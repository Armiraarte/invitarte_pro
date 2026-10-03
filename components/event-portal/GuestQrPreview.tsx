import React from 'react';
import QRCode from 'qrcode';

type GuestQrPreviewProps = {
  value: string;
  title: string;
  subtitle: string;
  showValue?: boolean;
};

export const GuestQrPreview: React.FC<GuestQrPreviewProps> = ({ value, title, subtitle, showValue = true }) => {
  const [svgMarkup, setSvgMarkup] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    const generateQr = async () => {
      try {
        const nextSvgMarkup = await QRCode.toString(value, {
          type: 'svg',
          width: 192,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#111827',
            light: '#ffffff',
          }
        });

        if (isCancelled) {
          return;
        }

        setSvgMarkup(nextSvgMarkup);
        setError(null);
      } catch {
        if (isCancelled) {
          return;
        }

        setSvgMarkup('');
        setError('No pudimos generar el QR de este invitado.');
      }
    };

    void generateQr();

    return () => {
      isCancelled = true;
    };
  }, [value]);

  if (error) {
    return (
      <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold leading-5 text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-3 min-[560px]:grid-cols-[200px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[18px] border border-black/10 bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
        {svgMarkup ? (
          <div
            className="mx-auto aspect-square w-full max-w-[180px]"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-[14px] bg-zinc-50 text-[12px] font-semibold text-zinc-500">
            Generando QR...
          </div>
        )}
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white/82 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{title}</p>
        <p className="mt-2 text-[13px] leading-6 text-zinc-700">{subtitle}</p>
        {showValue ? (
          <code className="mt-3 block break-all rounded-[14px] bg-black/[0.04] px-3 py-2 text-[11px] font-black text-zinc-800">
            {value}
          </code>
        ) : null}
      </div>
    </div>
  );
};
