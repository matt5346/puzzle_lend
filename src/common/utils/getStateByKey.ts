import { IData } from '@src/common/entities/Pool';

export const getStateByKey = (values: IData[], key: string) => values.find((state) => state.key === key)?.value;
