import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageAddress = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const queryClient = useQueryClient();

  const { data: addresses, isLoading, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:3000/address');
      return res.data;
    },
  });

  console.log("addresses", addresses);

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`http://localhost:3000/address/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        defaultAddress: addr.id === id,
      }));
      await axios.put(`http://localhost:3000/address/${id}`, { defaultAddress: true });
      queryClient.setQueryData(['addresses'], updatedAddresses);
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">⚠️ Failed to load addresses.</div>;

  return (
    <div className="bg-white dark:bg-gray-900 px-10 py-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-black dark:bg-gray-800 text-white py-2 px-4 rounded mb-6 hover:bg-gray-800 dark:hover:bg-gray-700"
        >
          + Add New Address
        </button>
        <div className="space-y-6">
          {addresses.map((address) => (
            <div key={address.id} className="border-b border-gray-300 dark:border-gray-700 pb-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="col-span-2">
                  <h2 className="font-bold text-lg text-black dark:text-white">
                    {address.name}{' '}
                    <span className="ml-4 font-normal text-gray-500 dark:text-gray-400 text-base">{address.mobile}</span>
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                    {address.specificAddress}, {address.ward}, {address.district}, {address.province}
                  </p>
                </div>
                <div className="col-span-1">
                  {address.defaultAddress ? (
                    <span className="text-black dark:text-white">Default</span>
                  ) : (
                    <button 
                      className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-300" 
                      onClick={() => setDefaultMutation.mutate(address.id)}
                    >
                      Set default
                    </button>
                  )}
                </div>
                <div className="col-span-1 flex flex-col space-y-2 items-end">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="flex items-center space-x-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded w-20 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="flex items-center space-x-1 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 dark:border-red-700 py-1 px-2 rounded w-20 hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageAddress;