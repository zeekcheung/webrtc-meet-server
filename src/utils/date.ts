export const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let formattedDate = format;
  formattedDate = formattedDate.replace(/YYYY/, year.toString(10));
  formattedDate = formattedDate.replace(/MM/, formatDateLess10(month));
  formattedDate = formattedDate.replace(/DD/, formatDateLess10(day));
  formattedDate = formattedDate.replace(/HH/, formatDateLess10(hours));
  formattedDate = formattedDate.replace(/mm/, formatDateLess10(minutes));
  formattedDate = formattedDate.replace(/ss/, formatDateLess10(seconds));

  return formattedDate;
};

export const formatDateLess10 = (date: number) =>
  date < 10 ? `0${date}` : `${date}`;

/**
 * 获取 MySQL `datetime` 格式的时间
 * @returns
 */
export const getDatetime = () => formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
