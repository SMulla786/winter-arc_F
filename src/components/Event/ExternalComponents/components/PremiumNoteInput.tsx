import {Sparkles} from 'lucide-react';

export const PremiumNoteInput: React.FC<{
  note: string;
  onChange: (v: string) => void;
}> = ({note, onChange}) => (
  <div className="premium-shadow from-gray-50 to-gray-100 rounded-3xl bg-gradient-to-br p-6">
    <label className="font-elegant mb-4 block text-lg font-semibold text-white">
      Special Requests
    </label>
    <div className="relative">
      <textarea
        rows={4}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share any dietary preferences, allergies, or special instructions for our team..."
        className="border-gold/20 focus:border-gold focus:ring-gold w-full rounded-lg border bg-black px-4 py-4 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
      />
      <div className="absolute bottom-3 right-3">
        <Sparkles className="text-gold h-4 w-4" />
      </div>
    </div>
  </div>
);
