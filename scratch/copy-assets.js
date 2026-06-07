const fs = require('fs');
const path = require('path');

const srcBusinesswoman = 'C:\\Users\\Ksa\\.gemini\\antigravity-ide\\brain\\fa8a09da-e43e-49c8-9142-85af25f81237\\businesswoman_security_app_1780864461361.png';
const srcCar = 'C:\\Users\\Ksa\\.gemini\\antigravity-ide\\brain\\fa8a09da-e43e-49c8-9142-85af25f81237\\khronos_security_car_1780864475914.png';

const destBusinesswoman = 'c:\\Users\\Ksa\\Downloads\\Khronos Serviços\\public\\images\\businesswoman-security.png';
const destCar = 'c:\\Users\\Ksa\\Downloads\\Khronos Serviços\\public\\images\\security-car.png';

try {
  if (fs.existsSync(srcBusinesswoman)) {
    fs.copyFileSync(srcBusinesswoman, destBusinesswoman);
    console.log('Copied businesswoman image successfully!');
  } else {
    console.error('Source businesswoman image does not exist.');
  }

  if (fs.existsSync(srcCar)) {
    fs.copyFileSync(srcCar, destCar);
    console.log('Copied security car image successfully!');
  } else {
    console.error('Source security car image does not exist.');
  }
} catch (err) {
  console.error('Error copying assets:', err);
}
