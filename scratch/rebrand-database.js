const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/Ksa/Downloads/Khronos Serviços';

const { createClient } = require(path.join(projectDir, 'node_modules/@supabase/supabase-js'));

// Read env
const envFile = fs.readFileSync(path.join(projectDir, '.env.local'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables not loaded.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function rebrandString(str) {
  if (typeof str !== 'string') return str;
  // Replace Hubly Pro, Hubly Pro, Hubly, etc.
  let result = str;
  result = result.replace(/Hubly Pro/g, 'Khronos');
  result = result.replace(/hubly pro/g, 'khronos');
  result = result.replace(/Hubly/g, 'Khronos');
  result = result.replace(/hubly/g, 'khronos');
  result = result.replace(/VIA HUBLY PRO\?/g, 'VIA GRUPO KHRONOS?');
  return result;
}

function rebrandValue(val) {
  if (typeof val === 'string') {
    return rebrandString(val);
  } else if (Array.isArray(val)) {
    return val.map(item => rebrandValue(item));
  } else if (val !== null && typeof val === 'object') {
    const newVal = {};
    for (const key in val) {
      newVal[key] = rebrandValue(val[key]);
    }
    return newVal;
  }
  return val;
}

async function runMigration() {
  try {
    console.log('Fetching site_settings from database...');
    const { data: rows, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      process.exit(1);
    }

    console.log(`Found ${rows.length} rows. Rebranding content...`);
    for (const row of rows) {
      const originalValue = row.value;
      const rebrandedValue = rebrandValue(originalValue);
      console.log(`Rebranding row key: ${row.key}`);
      
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({ key: row.key, value: rebrandedValue });

      if (updateError) {
        console.error(`Error updating row key ${row.key}:`, updateError);
      } else {
        console.log(`Successfully rebranded and saved row key: ${row.key}`);
      }
    }
    console.log('Database rebranding complete!');
  } catch (err) {
    console.error('Unexpected error in migration:', err);
  }
}

runMigration();
