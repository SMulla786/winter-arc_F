import {FaCheckCircle} from 'react-icons/fa';
import POS_CORE_PACK_IMG from '../assets/images/pricing/pos-core-pack.webp';
import GROWTH_PACK_IMG from '../assets/images/pricing/growth-pack.webp';
import SCALE_PACK_IMG from '../assets/images/pricing/scale-pack.webp';

const Pricing = () => {
  return (
    <div className="px-8 md:px-32">
      <div className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-black md:text-4xl">
          Transparent and affordable pricing
        </h1>
        <p className="text-sm md:text-base">
          Manage restaurant operations efficiently without burning a hole in
          your pockets
        </p>
      </div>
      <div className="grid gap-16 py-8 md:grid-cols-2 md:py-16">
        <div className="flex justify-center md:hidden">
          <img src={POS_CORE_PACK_IMG} alt="pos-core-pack" />
        </div>
        <div className="flex flex-col gap-4 max-md:items-center">
          <h2 className="text-[1.8rem] font-bold text-primary md:text-5xl">
            Menubook POS Core
          </h2>
          <p className="text-lg max-md:text-center">
            For any restaurant looking to automate their entire operation with
            affordable and easy-to-use software
          </p>
          <div className="text-black">
            <h3 className="mb-2 text-3xl font-bold">₹10,000*</h3>
            <p className="text-lg">first year/per outlet</p>
          </div>
          <span>+₹7,000 renewal from next year</span>
          <button className="my-2 w-3/4 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 md:w-fit">
            Book a free demo
          </button>
          <ul className="flex h-full flex-col justify-between max-md:gap-4 max-md:self-start max-md:text-sm">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">
                Efficent cloud-based POS system that works with every OS
              </p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Quick and easy inventory management</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">
                100+ Real-time and simplified reporting
              </p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Seamless online ordering system</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">24x7 support</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Aggregator integrations</p>
            </li>
          </ul>
        </div>
        <div className="flex justify-center max-md:hidden">
          <img src={POS_CORE_PACK_IMG} alt="pos-core-pack" />
        </div>
      </div>
      <div className="mb-8 rounded-lg bg-slate-200 p-4">
        <p className="max-md:text-justify max-md:text-sm">
          <span className="font-bold">Note:</span> The prices mentioned on the
          page are exclusive of GST & only for the outlets in India. Please
          contact us for details of outlets located outside India.
        </p>
      </div>
      <div className="grid gap-16 py-16 md:grid-cols-2">
        <div className="w-full">
          <img src={GROWTH_PACK_IMG} alt="pos-core-pack" className="w-full" />
        </div>
        <div className="flex flex-col gap-4 max-md:items-center">
          <h2 className="text-4xl font-bold text-primary">
            Menubook Growth Plan
          </h2>
          <p className="text-lg max-md:text-center">
            Power up your Menubook Core with features that simplify your kitchen
            operations, customer management, and staff responsibilities
          </p>
          <div className="text-black">
            <h3 className="mb-2 text-3xl font-bold">₹20,000*</h3>
            <p className="text-lg">per year/per outlet</p>
          </div>
          <button className="my-2 w-3/4 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 md:w-fit">
            Book a free demo
          </button>
          <ul className="flex h-full flex-col gap-4 max-md:self-start max-md:text-sm">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">
                Holistic and easy-to-use tech solution
              </p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Works in perfect sync with POS</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">
                Android and Windows-based apps for multiple devices
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid gap-16 py-16 md:grid-cols-2">
        <div className="w-full md:hidden">
          <img src={SCALE_PACK_IMG} alt="pos-core-pack" className="w-full" />
        </div>
        <div className="flex flex-col gap-4 max-md:items-center">
          <h2 className="text-4xl font-bold text-primary">
            Menubook Scale Plan
          </h2>
          <p className="text-lg max-md:text-center">
            A power-packed kit to help you automate your daily operations, data
            & invoice management, staff management, and much more
          </p>
          <div className="text-black">
            <h3 className="mb-2 text-3xl font-bold">₹30,000*</h3>
            <p className="text-lg">per year/per outlet</p>
          </div>
          <button className="my-2 w-3/4 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 md:w-fit">
            Book a free demo
          </button>
          <ul className="flex h-full flex-col gap-4 max-md:self-start max-md:text-sm">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Kit for complete business automation</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Cloud-based advanced solutions</p>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-sm" />
              <p className="text-black">Android and Windows-based apps</p>
            </li>
          </ul>
        </div>
        <div className="max-md:hidden">
          <img src={SCALE_PACK_IMG} alt="pos-core-pack" />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
