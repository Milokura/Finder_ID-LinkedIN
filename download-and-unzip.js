import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const fileId = '1E71GBsxnHYuzHRdSn9h41S0b49h0vCfF';
const zipPath = path.join(process.cwd(), 'temp_archive.zip');
const extractPath = path.join(process.cwd(), 'temp_extracted');

async function downloadGoogleDriveFile(id, destPath) {
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  console.log(`Requesting URL: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  // Check if it's a redirection or confirmation HTML page
  const text = await response.clone().text();
  
  if (text.includes('id="download-form"') || text.includes('confirm=') || text.includes('Google Drive - Virus scan warning')) {
    console.log('Detected Google Drive virus scan warning page or redirection. Attempting to extract confirmation token...');
    
    // Attempt to extract the confirmation token from the form/links
    // Typical patterns: confirm=XXXX or name="confirm" value="XXXX"
    const confirmMatch = text.match(/confirm=([A-Za-z0-9_\\-]+)/) || text.match(/name="confirm"\s+value="([A-Za-z0-9_\\-]+)"/);
    if (confirmMatch) {
      const confirmToken = confirmMatch[1];
      console.log(`Extracted confirmation token: ${confirmToken}`);
      
      const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${id}`;
      console.log(`Requesting confirmed download via: ${confirmUrl}`);
      
      const confirmedResponse = await fetch(confirmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          // Include cookies if any were returned in the original request's set-cookie headers
          'Cookie': response.headers.get('set-cookie') || ''
        }
      });
      
      if (!confirmedResponse.ok) {
        throw new Error(`HTTP Error ${confirmedResponse.status} during confirmed download`);
      }
      
      const buffer = await confirmedResponse.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(buffer));
      return buffer.byteLength;
    } else {
      console.log('Could not extract confirmation token from confirmation page.');
    }
  }

  // If no confirmation was needed or if extraction failed, try saving the first response as-is (if it's not a sign-in wall)
  if (text.includes('https://accounts.google.com/')) {
    throw new Error('Google Drive requires active Sign-In (Authentication). Please verify that the file sharing permissions are set to "Anyone with the link can view".');
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  return buffer.byteLength;
}

async function main() {
  try {
    const size = await downloadGoogleDriveFile(fileId, zipPath);
    console.log(`Download finished. Saving ${size} bytes...`);

    const isHtml = fs.readFileSync(zipPath).slice(0, 50).toString('utf8').includes('<html') || fs.readFileSync(zipPath).slice(0, 50).toString('utf8').includes('<!DOCTYPE');
    if (isHtml) {
      const sample = fs.readFileSync(zipPath).slice(0, 1000).toString('utf8');
      console.log("WARNING: Saved file is still HTML, not a raw zip. Content Sample:\n", sample);
      throw new Error(`Downloaded content is HTML, not a zip file.`);
    }

    console.log('Extracting ZIP archive...');
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log(`Success! Archive extracted to ${extractPath}.`);

  } catch (error) {
    console.error('Error during update process:', error.message);
    process.exit(1);
  }
}

main();
