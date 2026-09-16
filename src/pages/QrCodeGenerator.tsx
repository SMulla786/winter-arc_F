import QRCodeGenerator from '@/components/QrCode/QrCodeGenerate';
const QrCodeGeneratorPage: React.FC = () => {
  return (
    <div className="max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <QRCodeGenerator />
        </div>
      </div>
    </div>
  );
};

export default QrCodeGeneratorPage;
