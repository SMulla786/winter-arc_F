import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  component: Policies,
});

function Policies() {
  return (
    <div className="text-gray-800 mx-auto max-w-5xl space-y-16 px-6 py-12">
      {/* Privacy Policy */}
      <section>
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-4">
          At <strong>PhygitalTech Pvt. Ltd.</strong> ("Company", "we", "our",
          "us"), we respect your privacy and are committed to protecting it.
        </p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">
          1. Information We Collect
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Personal Information (Name, Email, Phone, Address)</li>
          <li>Business Information (Catering company, event details)</li>
          <li>Payment Information (processed securely via PhonePe)</li>
          <li>Usage Data (logs, preferences)</li>
        </ul>
        <h2 className="mb-2 mt-6 text-xl font-semibold">2. Data Security</h2>
        <p>
          We use industry-standard security. Transactions via PCI-DSS compliant
          gateways.
        </p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">Contact</h2>
        <p>
          Email: support@phygitaltech.com <br />
          Phone: +91-9511640351
        </p>
      </section>

      {/* Terms & Conditions */}
      <section>
        <h1 className="mb-6 text-3xl font-bold">Terms & Conditions</h1>
        <h2 className="mb-2 mt-6 text-xl font-semibold">1. Introduction</h2>
        <p>
          These Terms govern your use of Menubook software provided by
          PhygitalTech Pvt. Ltd.
        </p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">2. Eligibility</h2>
        <p>You must be at least 18 years old to use Menubook.</p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">3. Use of Service</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Provide accurate and updated info</li>
          <li>Maintain confidentiality of your account</li>
        </ul>
        <h2 className="mb-2 mt-6 text-xl font-semibold">4. Governing Law</h2>
        <p>
          These Terms are governed by Indian law with jurisdiction in
          Sangli,Maharashtra.
        </p>
      </section>

      {/* Refund & Cancellation */}
      <section>
        <h1 className="mb-6 text-3xl font-bold">
          Refund & Cancellation Policy
        </h1>
        <h2 className="mb-2 mt-6 text-xl font-semibold">
          1. Order Cancellation
        </h2>
        <p>
          Customers may cancel orders up to 3 days before service. After this,
          cancellation may not be possible.
        </p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">2. Refunds</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Full refund if cancelled within window</li>
          <li>Refunds processed in 7–10 business days</li>
          <li>Advance fees may be non-refundable</li>
        </ul>
        <h2 className="mb-2 mt-6 text-xl font-semibold">3. Service Issues</h2>
        <p>Non-delivery → full refund. Partial delivery → pro-rata refund.</p>
      </section>

      {/* Service Delivery */}
      <section>
        <h1 className="mb-6 text-3xl font-bold">Service Delivery Policy</h1>
        <p>
          Menubook is SaaS. After payment, access is provisioned instantly to
          the registered account.
        </p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">1. Activation</h2>
        <p>Accounts are activated immediately after successful payment.</p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">2. Ongoing Access</h2>
        <p>Access continues until subscription expiry unless renewed.</p>
        <h2 className="mb-2 mt-6 text-xl font-semibold">3. Support</h2>
        <p>
          Contact{' '}
          <a
            href="mailto:support@phygitaltech.com"
            className="text-blue-600 underline"
          >
            support@phygitaltech.com
          </a>{' '}
          for service issues.
        </p>
      </section>
    </div>
  );
}
