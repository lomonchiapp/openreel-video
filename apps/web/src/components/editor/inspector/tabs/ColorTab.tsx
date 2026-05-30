import React from "react";
import { ColorGradingSection } from "../";
import { InspectorSection } from "../shell/InspectorSection";

export interface ColorTabProps {
  clipId: string;
  showColorGrading: boolean;
}

export const ColorTab: React.FC<ColorTabProps> = ({
  clipId,
  showColorGrading,
}) => {
  return (
    <>
      {showColorGrading && (
        <>
          <div data-inspector-tab="adjust" />
          <InspectorSection
            title="Color Grading"
            sectionId="color-grading"
            defaultOpen={false}
          >
            <ColorGradingSection clipId={clipId} />
          </InspectorSection>
        </>
      )}
    </>
  );
};
