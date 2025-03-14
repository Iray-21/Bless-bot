import chalk from 'chalk';
import cloudscraper from 'cloudscraper';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { promises as fs } from 'fs';
import readline from 'readline';

// Constants
const API_BASE_URL = "https://gateway-run.bls.dev/api/v1";
const IP_SERVICE_URL = "https://ipinfo.io/json";
const IDS_PER_USER = 5; // Setiap user menjalankan 5 ID
const RETRY_ATTEMPTS = 3; // Jumlah percobaan ulang
const RETRY_DELAY = 60000; // Interval percobaan ulang (60 detik)
const WAIT_AFTER_FAILURE = 10 * 60 * 1000; // Tunggu 10 menit setelah semua percobaan gagal
let useProxy;

// Helper function to get a random element from an array
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate random hardware info
function generateRandomHardwareInfo() {
    const cpuArchitectures = ["x86_64", "ARM64", "x86"];
    const cpuModels = [
        "Intel Core i7-10700K CPU @ 3.80GHz",
        "AMD Ryzen 5 5600G with Radeon Graphics",
        "Intel Core i5-10600K CPU @ 4.10GHz",
        "AMD Ryzen 7 5800X",
        "Intel Core i9-10900K CPU @ 3.70GHz",
        "AMD Ryzen 9 5900X",
        "Intel Core i3-10100 CPU @ 3.60GHz",
        "AMD Ryzen 3 3300X",
        "Intel Core i7-9700K CPU @ 3.60GHz",
    ];
    const cpuFeatures = ["mmx", "sse", "sse2", "sse3", "ssse3", "sse4_1", "sse4_2", "avx", "avx2", "fma"];
    const numProcessors = [4, 6, 8, 12, 16];
    const memorySizes = [8 * 1024 ** 3, 16 * 1024 ** 3, 32 * 1024 ** 3, 64 * 1024 ** 3];

    const randomCpuFeatures = Array.from({ length: Math.floor(Math.random() * cpuFeatures.length) + 1 }, () =>
        getRandomElement(cpuFeatures)
    );

    return {
        cpuArchitecture: getRandomElement(cpuArchitectures),
        cpuModel: getRandomElement(cpuModels),
        cpuFeatures: [...new Set(randomCpuFeatures)],
        numOfProcessors: getRandomElement(numProcessors),
        totalMemory: getRandomElement(memorySizes),
        extensionVersions: "0.1.8"
    };
}

// Read proxies from file
async function readProxies() {
    const data = await fs.readFile('proxy.txt', 'utf-8');
    const proxies = data.trim().split('\n').filter(proxy => proxy);
    return proxies;
}

// Read node and hardware IDs from file
async function readNodeAndHardwareIds() {
    const data = await fs.readFile('id.txt', 'utf-8');
    const ids = data.trim().split('\n').filter(id => id).map(id => {
        const [nodeId, hardwareId] = id.split(':');
        return { nodeId, hardwareId };
    });
    return ids;
}

// Read users from file
async function readUsers() {
    const data = await fs.readFile('user.txt', 'utf-8');
    const users = data.trim().split('\n').filter(user => user && !user.startsWith('#'));
    return users;
}

// Prompt user to use proxy
async function promptUseProxy() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(chalk.white.bold('⚙️ Do you want to use a proxy? (y/n): '), answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

// Fetch IP address using cloudscraper
async function fetchIpAddress(proxy) {
    const options = {
        proxy: proxy || null,
        headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        },
    };

    try {
        const response = await cloudscraper.get(IP_SERVICE_URL, options);
        const data = JSON.parse(response);

        return data?.ip || '0.0.0.0';
    } catch (error) {
        console.error(chalk.red(`Error fetching IP address: ${error.message}`));
        return '0.0.0.0';
    }
}

// Register node
async function registerNode(nodeId, hardwareId, ipAddress, proxy, authToken) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.8"
    };

    const registerUrl = `${API_BASE_URL}/nodes/${nodeId}`;
    console.log(chalk.green('\nRegistering Node ID : ') + chalk.yellow(`${chalk.bold(nodeId)}`));

    const payload = {
        ipAddress,
        hardwareId,
        hardwareInfo: generateRandomHardwareInfo(),
        extensionVersion: "0.1.8"
    };

    const options = {
        headers,
        json: payload,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(registerUrl, options);
        console.log(chalk.white.bold("Regist response     :\n") + chalk.blueBright(JSON.stringify(response)));
        return { success: true, response };
    } catch (error) {
        console.error(chalk.red(`Error Registering node : ${error.message}`));
        return {
            success: false,
            error: error.message,
            statusCode: error.statusCode || 500,
            isProxyError: proxy !== null // Menandai apakah kesalahan disebabkan oleh proxy
        };
    }
}

// Start session
async function startSession(nodeId, proxy, authToken) {
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.8"
    };

    const startSessionUrl = `${API_BASE_URL}/nodes/${nodeId}/start-session`;
    console.log(chalk.white.bold.italic(`\nStarting session. Please wait a moments...`));

    const options = {
        headers,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(startSessionUrl, options);
        return response;
    } catch (error) {
        console.error(chalk.red(`Error Starting Session : ${error.message}`));
        throw error;
    }
}

// Ping node
async function pingNode(nodeId, proxy, ipAddress, isB7SConnected, authToken) {
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.8"
    };

    const pingUrl = `${API_BASE_URL}/nodes/${nodeId}/ping`;

    const payload = { isB7SConnected };
    const options = {
        headers,
        json: payload,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(pingUrl, options);
        console.log(
          chalk.greenBright.bold('Ping Node ID : ') +
          chalk.white(`${chalk.bold(nodeId)}`) +
          chalk.greenBright.bold('\nUsing Proxy  : ') +
          chalk.white(`${chalk.bold(proxy)} | IP: ${chalk.bold(ipAddress)}`) +
          chalk.greenBright.bold('\nStatus       : ') +
          chalk.white(`${chalk.bold(response.status)}`)
        );

        return response;
    } catch (error) {
        console.error(chalk.red(`Error Pinging Node: ${error.message}`));
        throw error;
    }
}

// Check node status and rewards
async function checkNode(nodeId, proxy, authToken) {
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.8"
    };

    const checkUrl = `${API_BASE_URL}/nodes/${nodeId}`;
    const options = {
        headers,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.get(checkUrl, options);
        console.log(
          chalk.blueBright.bold('\nCheck Node response :') + 
          chalk.white(`\n${JSON.stringify(response)}\n`)
        );

        // Ambil informasi reward dari respons
        if (response.rewards) {
            const totalReward = response.rewards.totalReward || 0;
            const todayReward = response.rewards.todayReward || 0;
            console.log(chalk.yellow(`Rewards - Total: ${chalk.bold(totalReward)}, Today: ${chalk.bold(todayReward)}`));
        }

        return response;
    } catch (error) {
        console.error(chalk.red(`Error Checking Node: ${error.message}`));
        throw error;
    }
}

// Function to check internet connection
async function checkInternetConnection() {
    try {
        await cloudscraper.get('https://www.google.com');
        return true;
    } catch (error) {
        return false;
    }
}

// Function to try reconnecting to the internet
async function tryReconnectInternet() {
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 60000; // 1 minute

    while (attempts < maxAttempts) {
        console.log(chalk.yellow(`Attempting to reconnect to the internet (Attempt ${attempts + 1}/${maxAttempts})...`));
        const isConnected = await checkInternetConnection();
        if (isConnected) {
            console.log(chalk.green('Internet connection restored!'));
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
    }

    console.log(chalk.red('Failed to reconnect to the internet after multiple attempts.'));
    return false;
}

// Function to retry a function with a delay
async function retryWithDelay(fn, maxRetries = RETRY_ATTEMPTS, retryDelay = RETRY_DELAY) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            return result; // Jika berhasil, kembalikan hasilnya
        } catch (error) {
            console.error(chalk.red(`Attempt ${attempt} failed: ${error.message}`));
            if (attempt < maxRetries) {
                console.log(chalk.yellow(`Retrying in ${retryDelay / 1000} seconds...`));
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                throw error; // Jika semua percobaan gagal, lempar error
            }
        }
    }
}

// Function to process a single node
async function processNode(nodeId, hardwareId, proxy, useProxy, authToken, proxies) {
    let ipAddress = useProxy ? await fetchIpAddress(proxy) : null;

    try {
        // Coba daftar node dengan retry logic
        let registrationResult = await retryWithDelay(async () => {
            return await registerNode(nodeId, hardwareId, ipAddress, proxy, authToken);
        });

        // Jika pendaftaran gagal karena proxy, coba proxy lain atau tanpa proxy
        if (!registrationResult.success && registrationResult.isProxyError) {
            console.log(chalk.yellow(`Proxy failed, trying another proxy or without proxy...`));
            for (let i = 0; i < proxies.length; i++) {
                proxy = proxies[i];
                console.log(chalk.yellow(`Trying proxy: ${proxy}`));
                ipAddress = await fetchIpAddress(proxy);
                registrationResult = await retryWithDelay(async () => {
                    return await registerNode(nodeId, hardwareId, ipAddress, proxy, authToken);
                });

                if (registrationResult.success) break; // Jika berhasil, keluar dari loop
            }

            // Jika semua proxy gagal, coba tanpa proxy
            if (!registrationResult.success) {
                console.log(chalk.yellow(`All proxies failed, trying without proxy...`));
                proxy = null;
                ipAddress = await fetchIpAddress(proxy);
                registrationResult = await retryWithDelay(async () => {
                    return await registerNode(nodeId, hardwareId, ipAddress, proxy, authToken);
                });
            }
        }

        // Jika pendaftaran masih gagal, lewati node ini
        if (!registrationResult.success) {
            console.log(chalk.red(`Failed to register node after all attempts. Skipping node ${nodeId}...`));
            return;
        }

        // Lanjutkan ke startSession, pingNode, dan checkNode
        await retryWithDelay(async () => {
            return await startSession(nodeId, proxy, authToken);
        });
        await retryWithDelay(async () => {
            return await pingNode(nodeId, proxy, ipAddress, true, authToken);
        });
        await retryWithDelay(async () => {
            return await checkNode(nodeId, proxy, authToken);
        });
    } catch (error) {
        console.error(chalk.red.bold(`An error occurred: ${error.message}`));

        // Jika kesalahan disebabkan oleh koneksi internet, coba sambungkan kembali
        if (error.message.includes('ENOTFOUND') || error.message.includes('socket hang up')) {
            const isInternetRestored = await tryReconnectInternet();
            if (!isInternetRestored) {
                console.log(chalk.red.bold('Internet connection could not be restored. Stopping script...'));
                process.exit(1);
            }
        }

        // Tunggu 10 menit sebelum mencoba lagi
        console.log(chalk.white.bold(`\nWaiting for 10 minutes before retrying...\n`));
        await new Promise(resolve => setTimeout(resolve, WAIT_AFTER_FAILURE));
    }
}

// Main function to run all tasks
async function runAll() {
    try {
        console.log("");
        console.log(chalk.white('        ██╗██████╗  █████╗██╗   ██╗  █████╗███╗'));
        console.log(chalk.white('        ██║██╔══██╗██╔══██╗██╗ ██╔╝     ██╝ ██║'));
        console.log(chalk.white('        ██║██████╔╝███████║  ██╔╝     ██║   ██║'));
        console.log(chalk.white('        ██║██║  ██╗██╔══██║  ██║     █████║ ██║'));
        console.log(chalk.white('        ██║██║  ██╗██║  ██║  ██║     ╚════╝ ╚═╝'));
        console.log(chalk.white('        ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═╝  El-Psy-Kongroo'));
        console.log(chalk.greenBright('       < <  エ ル ・ プ サ イ ・ コングルゥ  > >'));
        console.log("");
        console.log(chalk.cyan('                  • BlessNetwork BOT •'));
        console.log(chalk.yellowBright('                •• github.com/Iray-21 ••'));
        console.log("");
        console.log("");
        useProxy = await promptUseProxy();
        console.log(chalk.white(`useProxy: ${useProxy}`));

        const users = await readUsers();
        console.log(chalk.white(`Loaded ${users.length} users`));

        const ids = await readNodeAndHardwareIds();
        console.log(chalk.white(`Loaded ${ids.length} node IDs`));

        const proxies = await readProxies();
        console.log(chalk.white(`Loaded ${proxies.length} proxies`));

        if (useProxy && proxies.length < ids.length) {
            throw new Error(`Number of proxies (${proxies.length}) does not match number of nodeId:hardwareId pairs (${ids.length})`);
        }

        while (true) {
            for (let userIndex = 0; userIndex < users.length; userIndex++) {
                const authToken = users[userIndex];
                const startIdIndex = userIndex * IDS_PER_USER;
                const endIdIndex = startIdIndex + IDS_PER_USER;

                // Ambil 5 ID untuk user ini
                const userIds = ids.slice(startIdIndex, endIdIndex);

                console.log(chalk.white(`\nProcessing User ${userIndex + 1} with ${userIds.length} nodes...`));

                // Proses setiap node untuk user ini
                for (let i = 0; i < userIds.length; i++) {
                    const { nodeId, hardwareId } = userIds[i];
                    const proxy = useProxy ? proxies[i] : null;

                    await processNode(nodeId, hardwareId, proxy, useProxy, authToken, proxies);
                }
            }

            console.log(chalk.white.bold(`\nWaiting for 10 minutes before next ping...\n`));
            await new Promise(resolve => setTimeout(resolve, WAIT_AFTER_FAILURE));
        }
    } catch (error) {
        console.error(chalk.red.bold(`An error occurred: ${error.message}`));
        process.exit(1);
    }
}

// Run the script
runAll();
