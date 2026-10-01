"use client";

type PdfMaterialViewerProps = {
  classId: string;
  studentLabel: string;
  authorCredit: string;
};

export function PdfMaterialViewer({ classId, studentLabel, authorCredit }: PdfMaterialViewerProps) {
  const watermark = `${studentLabel} · ${authorCredit}`;

  return (
    <div
      className="relative mt-4 overflow-hidden border border-slate-300 bg-white"
      onContextMenu={(event) => event.preventDefault()}
    >
      <iframe
        title={`Material PDF: ${authorCredit}`}
        src={`/api/clases/${classId}/pdf#toolbar=0&navpanes=0&scrollbar=0`}
        referrerPolicy="no-referrer"
        className="h-[72vh] min-h-[480px] w-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 grid select-none grid-cols-2 place-items-center overflow-hidden opacity-[0.12] sm:grid-cols-3"
      >
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="-rotate-12 max-w-48 text-center text-xs font-bold uppercase text-black">
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}