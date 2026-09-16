import React, {useState} from 'react';
import FeatureSection from './FeatureSection';
import heroImage from '../../assets/images/hero.png';

const HeroSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('poss');

  const features = {
    poss: {
      image: 'https://petpoojaweb.gumlet.io/images/home-new/poss-slider1.png',
      title: 'Restaurant POS software made simple!',
      desc: 'Manage all your restaurant operations efficiently so you can grow your brand like a real boss!',
      link: '/Poss',
      linkText: 'Explore Poss',
    },
  };

  const handleBookDemoClick = () => {
    const section = document.getElementById('book-demo');
    if (section) {
      section.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  };

  const active = features[activeFeature as keyof typeof features];

  return (
    <>
      <div className="relative h-[550px] w-full rounded-bl-3xl rounded-br-3xl bg-[#09151F] py-[30px] sm:h-[600px] md:h-[800px] lg:h-[983px]">
        {/* Hero Section */}
        <section className="hero-container container mx-auto">
          <div className="font-poppins m-auto mt-[72px] flex max-w-[760px] flex-col items-center gap-3 text-center">
            {/* Title */}
            <h1 className="font-poppins hidden text-[34px] !leading-[115%] text-white md:block md:text-5xl lg:text-[68px]">
              All-in-one Catering Management Software
            </h1>

            {/* Mobile Title */}
            <h1 className="font-poppins text-3xl leading-snug text-white sm:text-4xl md:hidden">
              All-in-one Catering Management Software
            </h1>

            {/* Paragraph */}
            <p className="font-dmsans mt-2 max-w-2xl text-base text-[#9EAAB4] sm:text-lg md:mt-4 md:text-xl">
              &quot;From Inquiry to Invoice – Menubook automates every step of
              your catering workflow, making management effortless.&quot;
            </p>

            <button
              className="btn btn__primary2 font-dmsans mt-6 w-full max-w-xs rounded-lg bg-blue-800 px-6 py-3 text-base font-medium text-white hover:bg-blue-900 md:w-[190px]"
              onClick={handleBookDemoClick}
            >
              Get A Free Demo
            </button>
          </div>
        </section>

        {/* Feature Image Section */}
        <div className="container relative mx-auto mt-25 h-[500px] px-4">
          <div
            id="featureImagesContainer"
            className="flex min-h-[110px] items-end justify-center sm:min-h-[200px] md:min-h-[400px]"
          >
            <div
              id={`${activeFeature}Image`}
              className="feature-image m-auto flex w-[80%] max-w-6xl justify-center"
            >
              <img src={heroImage} alt={`${activeFeature} Interface`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
