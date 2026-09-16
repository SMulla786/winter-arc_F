import {
  uploadFiledish,
  uploadFileDishCat,
  uploadFileDisposals,
  uploadFileDisposalsCat,
  uploadFileRawCat,
  uploadFileRawMaterial,
  uploadFileUtensils,
  uploadFileUtensilsCat,
} from '@/lib/api/cateror/newDataUpload';
import {useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useUploadFiledish = () => {
  return useMutation({
    mutationFn: uploadFiledish,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFiledRawMaterial = () => {
  return useMutation({
    mutationFn: uploadFileRawMaterial,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileDisposals = () => {
  return useMutation({
    mutationFn: uploadFileDisposals,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileUtensils = () => {
  return useMutation({
    mutationFn: uploadFileUtensils,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileDishCat = () => {
  return useMutation({
    mutationFn: uploadFileDishCat,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileRawCat = () => {
  return useMutation({
    mutationFn: uploadFileRawCat,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileDisposalsCat = () => {
  return useMutation({
    mutationFn: uploadFileDisposalsCat,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};

export const useUploadFileUtensilsCat = () => {
  return useMutation({
    mutationFn: uploadFileUtensilsCat,
    onSuccess: () => {
      toast.success('File Uploaded Succesfully!');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};
