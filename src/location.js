const anchors = [
 ["AR","Argentina",-34.60,-58.38],["AU","Australia",-35.28,149.13],["AT","Austria",48.21,16.37],["BE","Belgium",50.85,4.35],["BR","Brazil",-15.79,-47.88],["CA","Canada",45.42,-75.70],["CL","Chile",-33.45,-70.67],["CO","Colombia",4.71,-74.07],
 ["CZ","Czechia",50.08,14.44],["DK","Denmark",55.68,12.57],["EG","Egypt",30.04,31.24],["FI","Finland",60.17,24.94],["FR","France",48.86,2.35],["DE","Germany",52.52,13.41],["GR","Greece",37.98,23.73],["HK","Hong Kong",22.32,114.17],
 ["HU","Hungary",47.50,19.04],["IN","India",28.61,77.21],["ID","Indonesia",-6.21,106.85],["IE","Ireland",53.35,-6.26],["IL","Israel",31.77,35.21],["IT","Italy",41.90,12.50],["JP","Japan",35.68,139.69],["KE","Kenya",-1.29,36.82],
 ["MY","Malaysia",3.14,101.69],["MX","Mexico",19.43,-99.13],["NL","Netherlands",52.37,4.90],["NZ","New Zealand",-41.29,174.78],["NG","Nigeria",9.08,7.40],["NO","Norway",59.91,10.75],["PH","Philippines",14.60,120.98],["PL","Poland",52.23,21.01],
 ["PT","Portugal",38.72,-9.14],["RO","Romania",44.43,26.10],["SA","Saudi Arabia",24.71,46.68],["SG","Singapore",1.35,103.82],["ZA","South Africa",-25.75,28.19],["KR","South Korea",37.57,126.98],["ES","Spain",40.42,-3.70],["SE","Sweden",59.33,18.07],
 ["CH","Switzerland",46.95,7.45],["TW","Taiwan",25.03,121.57],["TH","Thailand",13.76,100.50],["TR","Türkiye",39.93,32.86],["AE","United Arab Emirates",24.45,54.38],["GB","United Kingdom",51.51,-0.13],["US","United States",38.91,-77.04],["VN","Vietnam",21.03,105.85]
];
export const supportedMarkets = anchors.map(([code,name]) => ({code,name})).sort((a,b) => a.name.localeCompare(b.name));
export function localeMarket() { const region = new Intl.Locale(navigator.language).region; return supportedMarkets.some(({code}) => code===region) ? region : "US"; }
