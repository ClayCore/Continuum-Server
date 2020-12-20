import StorageInterface from '../models/Storage';

var storage: StorageInterface;

export const initStorage = (storageImplementation: StorageInterface): void => {
    storage = storageImplementation;
};

export const getStorage = (): StorageInterface => {
    return storage;
};
