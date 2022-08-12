const today = new Date();
const year = today.getFullYear();
const month = `${today.getMonth() + 1}`;
const date = `${today.getDate().toLocaleString('sg-SG')}`;
const hours = `${today.getHours().toLocaleString('sg-SG')}`;
const minutes = `${today.getMinutes().toLocaleString('sg-SG')}`;
const seconds = `${today.getSeconds().toLocaleString('sg-SG')}`;

const timeStr = `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;