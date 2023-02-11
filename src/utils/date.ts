import * as dayjs from 'dayjs';

/**
 * 获取 MySQL `datetime` 格式的时间
 * @returns
 */
export const getDatetime = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
