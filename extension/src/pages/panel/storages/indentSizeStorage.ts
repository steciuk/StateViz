import { StorageType, createStorage } from '@src/shared/storages/base';

const indentSizeStorage = createStorage('StateViz-indent', 12, {
	storageType: StorageType.Local,
});

export default indentSizeStorage;

