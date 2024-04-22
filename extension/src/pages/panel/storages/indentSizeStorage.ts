import { StorageType, createStorage } from '@src/shared/storages/base';

const indentSizeStorage = createStorage('state-viz-indent', 12, {
	storageType: StorageType.Local,
});

export default indentSizeStorage;
