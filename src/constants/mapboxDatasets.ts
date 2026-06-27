import { LayerType } from '@/constants/layers';

/** Default Mapbox dataset id → layer. Fallback for `/api/entries` when
 *  `MAPBOX_DATASET_NAMES` is unset (relies on `MAPBOX_DATASET_IDS` order/ids). */
export const MAPBOX_DEFAULT_DATASET_ID_TO_LAYER: Record<string, LayerType> = {
  ckv6rxyld5hre20phzrg56r3w: 'edition',
  ckx08odti3jzv28k3qtc13k38: 'musique',
  ckz5f9z090p4w20qf0uk7h5h5: 'photographie',
  ckx0j58950nx427nvvqkimwbg: 'audiovisuel',
  ckzfucuoa1ec728r0twbxwa8z: 'ville',
  cl9haqkad219h22tmwyzye55t: 'initiative',
};
