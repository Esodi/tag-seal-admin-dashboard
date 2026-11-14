import { MediaPreviewButton } from "@/components/media/media-preview";
import { DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import type { VetDocument, VetRecord } from "./types";
import { missingVetDocuments, requiredVetDocuments, vetDocumentLabel } from "./vet-document-rules";

function DocumentLink({ path, document }: { path: string; document: VetDocument }) {
  return <MediaPreviewButton source={{ name: document.originalName, mime: document.mime, size: document.size, href: `${path}/documents/${document.uuid}` }} />;
}

/** Credentials the vet uploaded from the app, previewed inline through the admin proxy. */
export function VetDocumentsSection({ row, path }: { row: VetRecord; path: string }) {
  const documents = row.documents ?? [];
  const missing = missingVetDocuments(row);
  const others = documents.filter((d) => d.type === "other");
  return <DetailSection title="Documents" description={missing.length ? `Missing: ${missing.map(vetDocumentLabel).join(", ")}. Approval stays disabled until the vet uploads them.` : "All required documents are uploaded."}>
    {requiredVetDocuments.map((type) => {
      const document = documents.find((d) => d.type === type);
      return <DetailItem key={type} label={vetDocumentLabel(type)}>
        {document ? <DocumentLink path={path} document={document} /> : <span className="text-destructive">Not uploaded</span>}
      </DetailItem>;
    })}
    {others.map((document) => <DetailItem key={document.uuid} label={vetDocumentLabel("other")}><DocumentLink path={path} document={document} /></DetailItem>)}
  </DetailSection>;
}
