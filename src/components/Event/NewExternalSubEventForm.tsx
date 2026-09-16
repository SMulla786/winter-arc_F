import React from 'react';
import {
  CaterorDetailsCard,
  DynamicLoader,
  GlobalStyles,
  PDFContent,
  PremiumAdditionalServicesSection,
  PremiumBottomActionBar,
  PremiumCustomDishSelection,
  PremiumEventSummaryCard,
  PremiumExtraDishesSection,
  PremiumHeader,
  PremiumMenuTypeSelection,
  PremiumNoteInput,
  PremiumPackageDishSelection,
  PremiumPackageSelection,
  PremiumQuickSummary,
  PremiumSelectedPackageCard,
  Route,
} from './ExternalComponents';
import {useSubEventForm} from './ExternalComponents/hooks/useSubEventForm';

const NewExternalSubEventForm: React.FC = () => {
  const {id: subEventId, caterorid: caterorId} = Route.useParams();

  const {
    // State
    selectedPackage,
    selectedDishes,
    selectedFeature,
    activeTab,
    setActiveTab,
    isInitialLoading,
    extraDishes,
    selectedAddons,
    expandedCategories,
    setExpandedCategories,
    expandedPackageCategories,
    setExpandedPackageCategories,
    note,
    setNote,
    showSummary,
    setShowSummary,
    printRef,

    // Data
    dishes,
    subEvent,
    cateror,
    formattedPackages,
    filteredAdditionalServices,
    groupedDishes,
    singlePackage,
    lastUpdated,
    isPending,

    // Handlers
    setSelectedPackage,
    setSelectedDishes,
    setSelectedFeature,
    toggleCategory,
    togglePackageCategory,
    handleBackToOptions,
    handleDishToggle,
    handleAddonToggle,
    handleDownloadPdf,
    handleSubmit,
    validateDishes,
  } = useSubEventForm(subEventId, caterorId);

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br via-white pb-20">
      <GlobalStyles />

      {isInitialLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <DynamicLoader image={cateror?.user?.image} />
        </div>
      ) : (
        <>
          <PremiumHeader
            selectedFeature={selectedFeature}
            onBack={handleBackToOptions}
          />

          <div className="space-y-2 px-4">
            {selectedFeature === 'NONE' && (
              <>
                <CaterorDetailsCard
                  fullname={cateror?.user?.fullname}
                  address={cateror?.address}
                  phone={cateror?.user?.phoneNumber}
                  logo={cateror?.image}
                  email={cateror?.user?.email}
                />
                <PremiumEventSummaryCard
                  subEvent={subEvent}
                  cateror={cateror}
                  date={subEvent?.date}
                />
                {!selectedPackage && (
                  <PremiumPackageSelection
                    packages={formattedPackages}
                    onSelect={(pkg) => {
                      setSelectedPackage({
                        id: pkg.pkg.id,
                        name: pkg.packageName,
                        price: pkg.pkg.price,
                      });
                      setSelectedDishes([]);
                    }}
                  />
                )}
                <PremiumMenuTypeSelection
                  onSelectPackage={() => setSelectedFeature('PACKAGE')}
                  onSelectDish={() => setSelectedFeature('DISH')}
                />
              </>
            )}

            {selectedFeature === 'PACKAGE' && !selectedPackage && (
              <PremiumPackageSelection
                packages={formattedPackages}
                onSelect={(pkg) => {
                  setSelectedPackage({
                    id: pkg.pkg.id,
                    name: pkg.packageName,
                    price: pkg.pkg.price,
                  });
                  setSelectedDishes([]);
                }}
              />
            )}

            {selectedPackage && (
              <PremiumSelectedPackageCard
                pkg={selectedPackage}
                onRemove={() => {
                  setSelectedPackage(null);
                  setSelectedDishes([]);
                  setExtraDishes([]);
                }}
              />
            )}

            {selectedFeature === 'DISH' && !selectedPackage && (
              <PremiumCustomDishSelection
                groupedDishes={groupedDishes}
                activeTab={activeTab}
                selectedDishes={selectedDishes}
                onDishToggle={handleDishToggle}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
              />
            )}

            {selectedPackage && singlePackage && (
              <>
                <PremiumPackageDishSelection
                  subevent={subEvent}
                  singlePackage={singlePackage}
                  selectedDishes={selectedDishes}
                  onDishesChange={setSelectedDishes} // ← this is usually what you want
                  expandedCategories={expandedPackageCategories}
                  onToggleCategory={togglePackageCategory}
                />
                {extraDishes.length > 0 && (
                  <PremiumExtraDishesSection
                    extraDishes={extraDishes}
                    selectedDishes={selectedDishes}
                    onDishToggle={handleDishToggle}
                    expandedCategories={expandedPackageCategories}
                    onToggleCategory={togglePackageCategory}
                    singlePackage={singlePackage}
                  />
                )}
              </>
            )}

            {(selectedFeature === 'DISH' || selectedPackage) &&
              filteredAdditionalServices.length > 0 && (
                <PremiumAdditionalServicesSection
                  services={filteredAdditionalServices}
                  selectedAddons={selectedAddons}
                  onToggle={handleAddonToggle}
                />
              )}

            {(selectedFeature === 'DISH' || selectedPackage) && (
              <PremiumNoteInput note={note} onChange={setNote} />
            )}

            {selectedDishes.length > 0 && (
              <PremiumQuickSummary
                selectedDishes={selectedDishes}
                dishes={dishes}
                singlePackage={singlePackage}
                extraDishes={extraDishes}
                showSummary={showSummary}
                onToggle={() => setShowSummary(!showSummary)}
              />
            )}
          </div>

          {(selectedFeature === 'DISH' || selectedPackage) && (
            <PremiumBottomActionBar
              count={selectedDishes.length}
              isPending={isPending}
              lastUpdated={lastUpdated}
              onSubmit={handleSubmit}
            />
          )}

          <PDFContent
            printRef={printRef}
            subEvent={subEvent}
            cateror={cateror}
            selectedPackage={selectedPackage}
            selectedDishes={selectedDishes ?? []}
            dishes={dishes ?? []}
            singlePackage={singlePackage}
            extraDishes={extraDishes ?? []}
            addons={selectedAddons ?? []}
            services={filteredAdditionalServices ?? []}
            note={note}
          />
        </>
      )}
    </div>
  );
};

export default NewExternalSubEventForm;
