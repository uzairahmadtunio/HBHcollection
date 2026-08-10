import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

function UploadButton({
  multiple,
  onUploaded,
}: {
  multiple?: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          try {
            const urls: string[] = [];
            for (const f of files) urls.push(await uploadImage(f));
            onUploaded(urls);
            toast.success(urls.length > 1 ? `${urls.length} images uploaded` : "Image uploaded");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="heading flex shrink-0 items-center gap-2 border border-gold px-4 py-2 text-[10px] tracking-[0.2em] text-gold disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        {busy ? "UPLOADING…" : "UPLOAD"}
      </button>
    </>
  );
}

/** Single image: paste a link OR upload a file. */
export function ImageField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder={placeholder ?? "Paste an image link…"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <UploadButton onUploaded={(urls) => onChange(urls[0] ?? "")} />
      </div>
      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="" className="h-24 w-20 border border-border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-primary p-1 text-primary-foreground"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Multiple images: newline separated links plus uploads. */
export function ImageListField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const urls = value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const setUrls = (next: string[]) => onChange(next.join("\n"));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <textarea
          rows={3}
          className={inputCls}
          placeholder="One image link per line…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <UploadButton multiple onUploaded={(added) => setUrls([...urls, ...added])} />
      </div>
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className="relative">
              <img src={u} alt="" className="h-20 w-16 border border-border object-cover" />
              <button
                type="button"
                onClick={() => setUrls(urls.filter((_, idx) => idx !== i))}
                className="absolute -right-2 -top-2 rounded-full bg-primary p-1 text-primary-foreground"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
