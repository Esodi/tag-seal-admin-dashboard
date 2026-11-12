const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { NextResponse } = require('next/server');
const root = path.resolve(__dirname, '..');
const originalResolve = Module._resolveFilename;
const originalLoad = Module._load;
let proxyResponse;
let lastProxy;
const cookieValues = { tagseal_admin_token: 'test-token', tagseal_admin_expires_at: String(Date.now() + 600000) };
Module._resolveFilename = function (request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...rest);
};
Module._load = function (request, parent, ...rest) {
  if (request === '@/components/providers/auth-session-provider') return { useAuthSession: () => ({ session: null, updateUser() {}, async signOut() {} }) };
  if (request === 'next/headers') return { cookies: async () => ({ get: (key) => cookieValues[key] ? { value: cookieValues[key] } : undefined }) };
  if (request === '@/lib/auth/admin-proxy') return { proxyAdminRequest: async (req, endpoint) => { lastProxy = { req, endpoint }; return proxyResponse; } };
  return originalLoad.call(this, request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, file);
};
const load = (file) => require(path.join(root, 'src', file));
const { ProfileEditor } = load('features/account/profile-dashboard.tsx');
const { profileValues, validateProfile } = load('features/account/types.ts');
const profileRoute = load('app/api/admin/account/profile/route.ts');
const sessionRoute = load('app/api/auth/session/route.ts');
const profile = { id: 11, username: 'asha', firstName: 'Asha', lastName: 'Juma', email: 'asha@example.test', phone: '+255712345678', phoneReadOnly: false, platformRole: 'admin', role: 'systemUser', status: 'active', permissions: ['reports.view'], createdAt: '2026-01-01T00:00:00Z' };

test('profile renders the FreshShop sections with accessible editable fields and actual access', () => {
  const html = renderToStaticMarkup(React.createElement(ProfileEditor, { initialProfile: profile }));
  for (const title of ['Personal information', 'Account role &amp; access', 'Current session', 'Delete account']) assert.ok(html.includes(title));
  for (const field of ['firstName', 'lastName', 'email', 'phone']) {
    assert.ok(html.includes(`for="profile-${field}"`));
    assert.ok(html.includes(`id="profile-${field}"`));
  }
  assert.ok(html.includes('reports view'));
  assert.ok(!html.includes('Full platform access'));
  assert.ok(!html.includes('<table'));
});

test('verified sign-in phones are read-only and super admin permissions are explicit', () => {
  const html = renderToStaticMarkup(React.createElement(ProfileEditor, { initialProfile: { ...profile, phoneReadOnly: true, platformRole: 'superAdmin' } }));
  const phone = html.match(/<input[^>]*id="profile-phone"[^>]*>/)[0];
  assert.match(phone, /readOnly=""/);
  assert.ok(html.includes('Changing it requires phone verification.'));
  assert.ok(html.includes('Full platform access'));
});

test('profile form payload contains personal fields only and reports invalid input', () => {
  assert.deepEqual(Object.keys(profileValues(profile)).sort(), ['email', 'firstName', 'lastName', 'phone']);
  assert.deepEqual(validateProfile(profileValues(profile)), {});
  assert.deepEqual(Object.keys(validateProfile({ firstName: ' ', lastName: '', email: 'bad', phone: 'bad' })).sort(), ['email', 'firstName', 'lastName', 'phone']);
});

test('successful saves refresh the cached identity; failed saves do not', async () => {
  proxyResponse = NextResponse.json({ data: profile });
  const request = new Request('http://localhost/api/admin/account/profile', { method: 'PATCH' });
  const saved = await profileRoute.PATCH(request);
  const cached = JSON.parse(Buffer.from(saved.cookies.get('tagseal_admin_user').value, 'base64url').toString());
  assert.equal(cached.firstname, 'Asha');
  assert.equal(cached.surname, 'Juma');
  assert.equal(cached.phone1, profile.phone);
  assert.equal(cached.platformRole, 'admin');
  assert.equal(lastProxy.endpoint, '/account/profile');
  proxyResponse = NextResponse.json({ message: 'Validation failed' }, { status: 422 });
  const failed = await profileRoute.PATCH(request);
  assert.equal(failed.cookies.get('tagseal_admin_user'), undefined);
});

test('deletion clears session cookies only after the backend confirms success', async () => {
  const request = new Request('http://localhost/api/admin/account/profile', { method: 'DELETE' });
  proxyResponse = NextResponse.json({ message: 'Account still in use' }, { status: 409 });
  assert.equal((await profileRoute.DELETE(request)).cookies.getAll().length, 0);
  proxyResponse = NextResponse.json({ message: 'Deleted' });
  const removed = await profileRoute.DELETE(request);
  for (const key of ['tagseal_admin_user', 'tagseal_admin_token', 'tagseal_admin_expires_at']) assert.equal(removed.cookies.get(key).value, '');
});

test('session refresh uses the same persisted profile as the editor', async () => {
  const previousFetch = global.fetch;
  global.fetch = async (url) => {
    assert.ok(url.endsWith('/api/v1/admin/account/profile'));
    return Response.json({ data: profile });
  };
  try {
    const response = await sessionRoute.GET();
    const session = await response.json();
    assert.equal(session.verified, true);
    assert.equal(session.user.firstname, 'Asha');
    assert.equal(session.user.surname, 'Juma');
    assert.equal(session.user.phone1, profile.phone);
  } finally { global.fetch = previousFetch; }
});
