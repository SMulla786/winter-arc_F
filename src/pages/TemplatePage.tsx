import React, {useState} from 'react';
import TemplateCard1 from '@/components/TemplatePage/TemplateCard1';
import TemplateCard2 from '@/components/TemplatePage/TemplateCard2';
import TemplateCard3 from '@/components/TemplatePage/TemplateCard3';
import TemplateCard4 from '@/components/TemplatePage/TemplateCard4';
import TemplateCard5 from '@/components/TemplatePage/TemplateCard5';
import TemplateCard6 from '@/components/TemplatePage/TemplateCard6';
import TemplateCard7 from '@/components/TemplatePage/TemplateCard7';
import TemplateCard8 from '@/components/TemplatePage/TemplateCard8';

const TemplatePage = ({
  template,
  setTemplate,
}: {
  template: string | null;
  setTemplate: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('template1');

  return (
    <div className="space-y-3">
      {/* <TemplateCard1 template={template} setTemplate={setTemplate} />
      <TemplateCard2 template={template} setTemplate={setTemplate} />
      <TemplateCard3 template={template} setTemplate={setTemplate} />
      <TemplateCard4 template={template} setTemplate={setTemplate} />
      <TemplateCard5 template={template} setTemplate={setTemplate} />
      <TemplateCard6 template={template} setTemplate={setTemplate} /> */}
      <TemplateCard7 template={template} setTemplate={setTemplate} />
      <TemplateCard8 template={template} setTemplate={setTemplate} />
    </div>
  );
};

export default TemplatePage;
