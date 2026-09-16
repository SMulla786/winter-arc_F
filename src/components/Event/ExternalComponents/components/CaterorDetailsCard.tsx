import {PhoneCall, Mail} from 'lucide-react';
import {PiAddressBook} from 'react-icons/pi';

export const CaterorDetailsCard: React.FC<{
  fullname: any;
  address: any;
  phone: any;
  logo: any;
  email: any;
}> = ({fullname, address, phone, logo, email}) => (
  <div className="premium-shadow from-gray-50 to-gray-100 rounded-lg bg-black px-8 py-2">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-3 text-center">
        <div className="rounded-md bg-white/10 p-2">
          <img src={logo} className="h-14 w-14 object-cover" />
        </div>
        <h2 className="font-elegant text-xl font-semibold text-white">
          {fullname}
        </h2>
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center space-x-3 rounded-lg bg-black">
        <PiAddressBook className="h-4 w-4 text-[#EFBF04]" />
        <div className="flex-1">
          <p className="text-xs text-white">{address}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 rounded-lg bg-black">
        <PhoneCall className="h-3.5 w-3.5 text-[#EFBF04]" />
        <div className="flex-1">
          <p className="text-xs text-white">{phone}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 rounded-lg bg-black">
        <Mail className="h-3.5 w-3.5 text-[#EFBF04]" />
        <div className="flex-1">
          <p className="text-xs text-white">{email}</p>
        </div>
      </div>
    </div>
  </div>
);
