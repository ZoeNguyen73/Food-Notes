const opening_hours = [
  {"is_overnight":false,"start":"1700","end":"2200","day":0},
  {"is_overnight":false,"start":"1700","end":"2200","day":1},
  {"is_overnight":false,"start":"1700","end":"2200","day":2},
  {"is_overnight":false,"start":"1700","end":"2200","day":3},
  {"is_overnight":false,"start":"1700","end":"2200","day":4},
  {"is_overnight":false,"start":"1700","end":"2200","day":5},
  {"is_overnight":false,"start":"1700","end":"2200","day":6}];
const day = 6;

const todayTimings = opening_hours.filter(timing => timing.day === day);

console.log(todayTimings);