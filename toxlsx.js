import { utils, writeFile } from 'xlsx';

export const toXlsx = (values) => {
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(values);
  utils.book_append_sheet(wb, ws, `Reports`);
  writeFile(wb, 'test.xlsx');
};
