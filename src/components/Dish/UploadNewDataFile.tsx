/*eslint-disable*/
import {
  useGetDishCategories,
  useGetRawMaterialCategoriesCat,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import React, {useEffect, useState} from 'react';
import * as XLSX from 'xlsx';
import {
  useUploadFiledish,
  useUploadFileDishCat,
  useUploadFileDisposals,
  useUploadFileDisposalsCat,
  useUploadFiledRawMaterial,
  useUploadFileRawCat,
  useUploadFileUtensils,
  useUploadFileUtensilsCat,
} from '@/lib/react-query/queriesAndMutations/cateror/newdatafileupload';
import toast from 'react-hot-toast';
// import ExcelJS from 'exceljs';
import {useGetDisposalCategories} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {useGetUtensilCategories} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import ExcelJS from 'exceljs';

const UploadNewDataFile = () => {
  // State for tracking upload status
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  // State for tracking selected file names
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {},
  );

  //   dish
  const {mutateAsync: uploadDish} = useUploadFiledish();
  const [dishObject, setDishObject] = useState<{name: string; id: string}[]>(
    [],
  );
  const [invalidDishCat, setInvalidDishCat] = useState<string[]>([]);
  const [dish, setDish] = useState<
    {name: string; description: string; type: string; categoryId: string}[]
  >([]);
  const {data: dishCategories} = useGetDishCategories();

  // raw material
  const {mutateAsync: uploadRawMaterial} = useUploadFiledRawMaterial();
  const [rawObject, setRawObject] = useState<{name: string; id: string}[]>([]);
  const [invalidRawCat, setInvalidRawCat] = useState<string[]>([]);
  const [rawMaterial, setRawMaterial] = useState<
    {name: string; unit: string; categoryId: string}[]
  >([]);
  const {data: categoriesRawMaterial} = useGetRawMaterialCategoriesCat();

  //   disposal
  const [disposal, setDisposaal] = useState<any[]>([]);
  const {mutateAsync: uploadDiposal} = useUploadFileDisposals();
  const [disposalObject, setDisposalObject] = useState<
    {name: string; id: string}[]
  >([]);
  const {data: disposalCat} = useGetDisposalCategories();
  const [invalidDisposalCat, setInvalidDisposalCat] = useState<string[]>([]);

  // utensils
  const [utensils, setUtensils] = useState<any[]>([]);
  const {mutateAsync: uploadUtensils} = useUploadFileUtensils();
  const [utensilsObject, setUtensilsObject] = useState<
    {name: string; id: string}[]
  >([]);
  const {data: utensilsCatData} = useGetUtensilCategories();
  const [invalidUtensilCat, setInvalidUtensilCat] = useState<string[]>([]);

  //  raw material category
  const {mutateAsync: uploadRawMaterialCat} = useUploadFileRawCat();

  //  dish category
  const [category, setCategory] = useState<any[]>([]);
  const {mutateAsync: uploadDishCat} = useUploadFileDishCat();

  // disposal cat
  const {mutateAsync: uploadDisposalCat} = useUploadFileDisposalsCat();

  // utensil cat
  const {mutateAsync: uploadUtensilsCat} = useUploadFileUtensilsCat();

  //  dish
  useEffect(() => {
    if (dishCategories) {
      const oneCat = dishCategories?.data?.categories?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setDishObject(oneCat);
    }
  }, [dishCategories]);

  // raw material
  useEffect(() => {
    if (categoriesRawMaterial) {
      const oneCat = categoriesRawMaterial?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setRawObject(oneCat);
    }
  }, [categoriesRawMaterial]);

  // disposals
  useEffect(() => {
    if (disposalCat) {
      const oneCat = disposalCat?.data?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setDisposalObject(oneCat);
    }
  }, [disposalCat]);

  // utensils
  useEffect(() => {
    if (utensilsCatData) {
      const oneCat = utensilsCatData?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setUtensilsObject(oneCat);
    }
  }, [utensilsCatData]);

  // Helper function to handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    validator: (data: any[]) => string[],
    setData: (data: any[]) => void,
    setInvalid: (invalid: string[]) => void,
    object: any[],
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update upload status and selected file name
    const fileName = e.target.name;
    setUploadStatus((prev) => ({...prev, [fileName]: 'processing'}));
    setSelectedFiles((prev) => ({...prev, [fileName]: file.name}));

    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      if (!binaryStr) {
        setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
        return;
      }

      try {
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const invalid = validator(jsonData);

        if (invalid.length > 0) {
          alert(
            `Invalid data found in Excel: ${invalid.join(', ')}. Please correct them before uploading.`,
          );
          setInvalid(invalid);
          setData([]);
          setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
          return;
        }

        setInvalid([]);
        const transFormedData = jsonData.map((each: any) => {
          const matchedCat = object.find((c) => c.name === each.Category);
          return {
            name: each.Name ?? '',
            categoryId: matchedCat ? matchedCat.id : null,
            description: each.Description ? each.Description : null,
            type: each.Type ? each.Type : null,
            unit: each.Unit ? each.Unit.toUpperCase() : null,
          };
        });

        setData(transFormedData);
        setUploadStatus((prev) => ({
          ...prev,
          [fileName]: 'success',
          [`${fileName}Count`]: transFormedData.length,
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
      }
    };

    reader.onerror = () => {
      setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
    };

    reader.readAsBinaryString(file);
  };

  // Function to clear selected file
  const clearFileSelection = (
    fileName: string,
    setData: (data: any[]) => void,
    setInvalid: (invalid: string[]) => void,
  ) => {
    setSelectedFiles((prev) => {
      const newFiles = {...prev};
      delete newFiles[fileName];
      return newFiles;
    });
    setUploadStatus((prev) => {
      const newStatus = {...prev};
      delete newStatus[fileName];
      delete newStatus[`${fileName}Count`];
      return newStatus;
    });
    setData([]);
    setInvalid([]);

    // Clear the file input
    const fileInput = document.querySelector(
      `input[name="${fileName}"]`,
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  //   dish
  const fileUploadDish = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validator = (jsonData: any[]) => {
      const uploadedCat = jsonData.map((each: any) => each.Category);
      const validCategoryNames = dishObject.map((cat) => cat.name);
      return uploadedCat.filter((cat) => !validCategoryNames.includes(cat));
    };

    handleFileUpload(e, validator, setDish, setInvalidDishCat, dishObject);
  };

  const exportDishFormat = async () => {
    const type = ['VEG', 'NONVEG'];
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Dish Format');
    ws.addRow(['Name', 'Description', 'Type', 'Category']);
    const categories = dishCategories?.data?.categories?.map((cat) => cat.name);
    for (let row = 2; row <= 10; row++) {
      ws.getCell(`C${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${type.join(',')}"`],
      };

      ws.getCell(`D${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categories.join(',')}"`],
      };
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'DishFormat.xlsx';
    link.click();
  };

  //  raw material
  const exportRawMaterialFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Raw Material Format');

    ws.addRow(['Name', 'Unit', 'Category']);
    const categories =
      categoriesRawMaterial?.data?.map((cat) => cat.name) || [];
    const units = ['KILOGRAM', 'BOTTLE', 'GRAM', 'LITRE', 'PIECE', 'METER'];
    for (let row = 2; row <= 10; row++) {
      ws.getCell(`B${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${units.join(',')}"`],
      };

      ws.getCell(`C${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categories.join(',')}"`],
      };
    }

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rawMaterialFormat.xlsx';
    link.click();
  };

  const fileUploadRawMaterial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const units = ['KILOGRAM', 'BOTTLE', 'GRAM', 'LITRE', 'PIECE', 'METER'];

    const validator = (jsonData: any[]) => {
      const uploadedCat = jsonData.map((each: any) => each.Category);
      const validCategoryNames = rawObject.map((cat) => cat.name);
      const invalidCategories = uploadedCat.filter(
        (cat) => !validCategoryNames.includes(cat),
      );

      const uploadedUnits = jsonData.map((each: any) =>
        each.Unit?.toUpperCase(),
      );
      const invalidUnits = uploadedUnits.filter(
        (unit) => unit && !units.includes(unit),
      );

      return [...invalidCategories, ...invalidUnits];
    };

    handleFileUpload(e, validator, setRawMaterial, setInvalidRawCat, rawObject);
  };

  //  disposals
  const exportDisposalsFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Disposals Format');
    ws.addRow(['Name', 'Category']);
    const categories = disposalCat?.data?.data?.map((cat) => cat.name);
    for (let row = 2; row <= 10; row++) {
      ws.getCell(`B${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categories.join(',')}"`],
      };
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'DisposalsFormat.xlsx';
    link.click();
  };

  const fileUploadDisposals = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validator = (jsonData: any[]) => {
      const uploadedCat = jsonData.map((each: any) => each.Category);
      const validCategoryNames = disposalObject.map((cat) => cat.name);
      return uploadedCat.filter((cat) => !validCategoryNames.includes(cat));
    };

    handleFileUpload(
      e,
      validator,
      setDisposaal,
      setInvalidDisposalCat,
      disposalObject,
    );
  };

  // utensils
  const exportutensilsFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Utensils Format');
    ws.addRow(['Name', 'Category']);
    const categories = utensilsCatData?.data?.map((cat) => cat.name);
    for (let row = 2; row <= 10; row++) {
      ws.getCell(`B${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categories.join(',')}"`],
      };
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'UtensilsFormat.xlsx';
    link.click();
  };

  const fileUploadUtensils = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validator = (jsonData: any[]) => {
      const uploadedCat = jsonData.map((each: any) => each.Category);
      const validCategoryNames = utensilsObject.map((cat) => cat.name);
      return uploadedCat.filter((cat) => !validCategoryNames.includes(cat));
    };

    handleFileUpload(
      e,
      validator,
      setUtensils,
      setInvalidUtensilCat,
      utensilsObject,
    );
  };

  //  dish category
  const exportDishCatFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Dish Cat Format');
    ws.addRow(['Name']);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'DishCatFormat.xlsx';
    link.click();
  };

  // raw category
  const exportRawCatFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Raw Cat Format');
    ws.addRow(['Name']);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'RawCatFormat.xlsx';
    link.click();
  };

  // disposals cat
  const exportDisposalsCatFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Disposals Cat Format');
    ws.addRow(['Name']);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'DisposalCatFormat.xlsx';
    link.click();
  };

  // utensils cat
  const exportUtensilsCatFormat = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Utensils Cat Format');
    ws.addRow(['Name']);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'UtensilsCatFormat.xlsx';
    link.click();
  };

  //  comonn category upload
  const fileUploadCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update upload status and selected file name
    const fileName = e.target.name;
    setUploadStatus((prev) => ({...prev, [fileName]: 'processing'}));
    setSelectedFiles((prev) => ({...prev, [fileName]: file.name}));

    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      if (!binaryStr) {
        setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
        return;
      }

      try {
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const transFormedData = jsonData.map((each: any) => ({
          name: each.Name ?? '',
        }));

        setCategory(transFormedData);
        setUploadStatus((prev) => ({
          ...prev,
          [fileName]: 'success',
          [`${fileName}Count`]: transFormedData.length,
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
      }
    };

    reader.onerror = () => {
      setUploadStatus((prev) => ({...prev, [fileName]: 'error'}));
    };

    reader.readAsBinaryString(file);
  };

  const onSubmit = async (type: string, mutateFn: any, data: any[]) => {
    try {
      setUploadStatus((prev) => ({...prev, [type]: 'uploading'}));
      await mutateFn({items: data});
      setUploadStatus((prev) => ({...prev, [type]: 'completed'}));
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setUploadStatus((prev) => ({...prev, [type]: 'error'}));
      toast.error(`Failed to upload ${type}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'processing':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'completed':
        return '✔️';
      default:
        return null;
    }
  };

  const UploadSection = ({
    title,
    onFileUpload,
    onExport,
    onSubmit,
    invalidCategories,
    data,
    type,
    fileInputName,
    clearFunction,
  }: {
    title: string;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onSubmit: () => void;
    invalidCategories: string[];
    data: any[];
    type: string;
    fileInputName: string;
    clearFunction: () => void;
  }) => {
    const status = uploadStatus[fileInputName] || '';
    const count = uploadStatus[`${fileInputName}Count`] || 0;
    const fileName = selectedFiles[fileInputName] || '';

    return (
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-meta-4">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          {title}
          {status && (
            <span className="ml-2 text-sm">
              {getStatusIcon(status)}
              {status === 'success' && count > 0 && ` ${count} items ready`}
              {status === 'completed' && ' Upload complete'}
            </span>
          )}
        </h3>

        {invalidCategories.length > 0 && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="font-bold">Invalid categories detected:</p>
            <ul className="list-inside list-disc">
              {invalidCategories.map((cat, index) => (
                <li key={index}>{cat}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="cursor-pointer rounded bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200">
            Choose File
            <input
              name={fileInputName}
              type="file"
              accept=".xlsx, .xls"
              onChange={onFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onExport}
            className="rounded bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200"
          >
            Download Template
          </button>
        </div>

        {fileName && (
          <div className="mb-4 flex items-center">
            <span className="text-gray-600 mr-2 text-sm">
              Selected: {fileName}
            </span>
            <button
              onClick={clearFunction}
              className="text-red-500 hover:text-red-700"
              aria-label="Clear selection"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-4">
          <button
            className={`rounded px-4 py-2 text-white ${
              invalidCategories.length > 0 || data.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
            type="button"
            disabled={invalidCategories.length > 0 || data.length === 0}
            onClick={onSubmit}
          >
            Upload {title}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 container mx-auto min-h-screen p-4">
      <h2 className="text-gray-800 mb-6 text-2xl font-bold">
        Upload Data Files
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Dish Section */}
        <UploadSection
          title="Dish"
          onFileUpload={fileUploadDish}
          onExport={exportDishFormat}
          onSubmit={() => onSubmit('dish', uploadDish, dish)}
          invalidCategories={invalidDishCat}
          data={dish}
          type="dish"
          fileInputName="dishFile"
          clearFunction={() =>
            clearFileSelection('dishFile', setDish, setInvalidDishCat)
          }
        />

        {/* Raw Material Section */}
        <UploadSection
          title="Raw Material"
          onFileUpload={fileUploadRawMaterial}
          onExport={exportRawMaterialFormat}
          onSubmit={() =>
            onSubmit('rawMaterial', uploadRawMaterial, rawMaterial)
          }
          invalidCategories={invalidRawCat}
          data={rawMaterial}
          type="rawMaterial"
          fileInputName="rawMaterialFile"
          clearFunction={() =>
            clearFileSelection(
              'rawMaterialFile',
              setRawMaterial,
              setInvalidRawCat,
            )
          }
        />

        {/* Disposals Section */}
        <UploadSection
          title="Disposals"
          onFileUpload={fileUploadDisposals}
          onExport={exportDisposalsFormat}
          onSubmit={() => onSubmit('disposal', uploadDiposal, disposal)}
          invalidCategories={invalidDisposalCat}
          data={disposal}
          type="disposal"
          fileInputName="disposalsFile"
          clearFunction={() =>
            clearFileSelection(
              'disposalsFile',
              setDisposaal,
              setInvalidDisposalCat,
            )
          }
        />

        {/* Utensils Section */}
        <UploadSection
          title="Utensils"
          onFileUpload={fileUploadUtensils}
          onExport={exportutensilsFormat}
          onSubmit={() => onSubmit('utensils', uploadUtensils, utensils)}
          invalidCategories={invalidUtensilCat}
          data={utensils}
          type="utensils"
          fileInputName="utensilsFile"
          clearFunction={() =>
            clearFileSelection(
              'utensilsFile',
              setUtensils,
              setInvalidUtensilCat,
            )
          }
        />

        {/* Dish Category Section */}
        <UploadSection
          title="Dish Category"
          onFileUpload={(e) => fileUploadCategory(e)}
          onExport={exportDishCatFormat}
          onSubmit={() => onSubmit('dishCategory', uploadDishCat, category)}
          invalidCategories={[]}
          data={category}
          type="dishCategory"
          fileInputName="dishCategoryFile"
          clearFunction={() =>
            clearFileSelection('dishCategoryFile', setCategory, () => {})
          }
        />

        {/* Raw Material Category Section */}
        <UploadSection
          title="Raw Material Category"
          onFileUpload={(e) => fileUploadCategory(e)}
          onExport={exportRawCatFormat}
          onSubmit={() =>
            onSubmit('rawMaterialCategory', uploadRawMaterialCat, category)
          }
          invalidCategories={[]}
          data={category}
          type="rawMaterialCategory"
          fileInputName="rawMaterialCategoryFile"
          clearFunction={() =>
            clearFileSelection('rawMaterialCategoryFile', setCategory, () => {})
          }
        />

        {/* Disposals Category Section */}
        <UploadSection
          title="Disposals Category"
          onFileUpload={(e) => fileUploadCategory(e)}
          onExport={exportDisposalsCatFormat}
          onSubmit={() =>
            onSubmit('disposalsCategory', uploadDisposalCat, category)
          }
          invalidCategories={[]}
          data={category}
          type="disposalsCategory"
          fileInputName="disposalsCategoryFile"
          clearFunction={() =>
            clearFileSelection('disposalsCategoryFile', setCategory, () => {})
          }
        />

        {/* Utensils Category Section */}
        <UploadSection
          title="Utensils Category"
          onFileUpload={(e) => fileUploadCategory(e)}
          onExport={exportUtensilsCatFormat}
          onSubmit={() =>
            onSubmit('utensilsCategory', uploadUtensilsCat, category)
          }
          invalidCategories={[]}
          data={category}
          type="utensilsCategory"
          fileInputName="utensilsCategoryFile"
          clearFunction={() =>
            clearFileSelection('utensilsCategoryFile', setCategory, () => {})
          }
        />
      </div>
    </div>
  );
};

export default UploadNewDataFile;
