// Webcam section for resort detail page.
// Inputs: resort slug
// Outputs: webcam link/embed if available, or muted fallback text
// Side effects: none
// Error behavior: gracefully shows fallback when no webcam data exists

import { ExternalLink, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getWebcamInfo } from "@/data/webcam-data";

interface WebcamSectionProps {
  slug: string;
}

export function WebcamSection({ slug }: WebcamSectionProps) {
  const webcam = getWebcamInfo(slug);

  return (
    <Card>
      <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">
        Webcams
      </h3>

      {webcam ? (
        <div className="space-y-3">
          {/* Embed image if available */}
          {webcam.embedImageUrl && (
            <a
              href={webcam.webcamPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-lg overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={webcam.embedImageUrl}
                alt={`${slug} webcam`}
                loading="lazy"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-white">View live</span>
              </div>
            </a>
          )}

          {/* Link to webcam page */}
          <a
            href={webcam.webcamPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-snow-primary hover:underline"
          >
            <Camera className="w-4 h-4" />
            View Webcams
            <ExternalLink className="w-3 h-3" />
          </a>

          {webcam.source && (
            <p className="text-[10px] text-snow-text-muted">Source: {webcam.source}</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-snow-text-muted">
          No webcam available for this resort.
        </p>
      )}
    </Card>
  );
}
