import chalk from 'chalk';
import cloudscraper from 'cloudscraper';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { promises as fs } from 'fs';
import readline from 'readline';

// Constants
const API_BASE_URL = "https://gateway-run.bls.dev/api/v1";
const IP_SERVICE_URL = "https://ipinfo.io/json";
let useProxy;

// Variabel untuk menyimpan jumlah node yang diproses hari ini
let nodesProcessedToday = 0;

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
        extensionVersions: "0.1.7"
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

// Read auth token from file
async function readAuthToken() {
    const data = await fs.readFile('user.txt', 'utf-8');
    return data.trim();
}

// Prompt user to use proxy
async function promptUseProxy() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(chalk.yellow('Do you want to use a proxy? (y/n): '), answer => {
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
        console.log(chalk.blue(`IP fetch response: ${data?.ip}`));
        return data?.ip || '0.0.0.0';
    } catch (error) {
        console.error(chalk.red(`Error fetching IP address: ${error.message}`));
        return '0.0.0.0';
    }
}

// Register node
async function registerNode(nodeId, hardwareId, ipAddress, proxy) {
    const authToken = await readAuthToken();
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.7"
    };

    const registerUrl = `${API_BASE_URL}/nodes/${nodeId}`;
    console.log(chalk.cyan(`Registering node with IP: ${ipAddress}, Hardware ID: ${hardwareId}`));

    const payload = {
        ipAddress,
        hardwareId,
        hardwareInfo: generateRandomHardwareInfo(),
        extensionVersion: "0.1.7"
    };

    const options = {
        headers,
        json: payload,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(registerUrl, options);
        console.log(chalk.green(`Registration response: ${JSON.stringify(response)}`));

        // Tambahkan ke jumlah node yang diproses hari ini
        nodesProcessedToday++;
        console.log(chalk.magenta(`Total nodes processed today: ${nodesProcessedToday}`));

        return response;
    } catch (error) {
        console.error(chalk.red(`Error registering node: ${error.message}`));
        throw error;
    }
}

// Start session
async function startSession(nodeId, proxy) {
    const authToken = await readAuthToken();
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.7"
    };

    const startSessionUrl = `${API_BASE_URL}/nodes/${nodeId}/start-session`;
    console.log(chalk.cyan(`Starting session for node ${nodeId}, it might take a while...`));

    const options = {
        headers,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(startSessionUrl, options);
        console.log(chalk.green(`Start session response: ${JSON.stringify(response)}`));
        return response;
    } catch (error) {
        console.error(chalk.red(`Error starting session: ${error.message}`));
        throw error;
    }
}

// Ping node
async function pingNode(nodeId, proxy, ipAddress, isB7SConnected) {
    const authToken = await readAuthToken();
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.7"
    };

    const pingUrl = `${API_BASE_URL}/nodes/${nodeId}/ping`;
    console.log(chalk.cyan(`Pinging node ${nodeId} using proxy ${proxy}`));

    const payload = { isB7SConnected };
    const options = {
        headers,
        json: payload,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.post(pingUrl, options);
        console.log(chalk.green(`Ping response, NodeID: ${chalk.bold(nodeId)}, Status: ${chalk.bold(response.status)}, Proxy: ${chalk.bold(proxy)}, IP: ${chalk.bold(ipAddress)}`));

        // Ambil informasi reward dari respons
        if (response.rewards) {
            const totalReward = response.rewards.totalReward || 0;
            const todayReward = response.rewards.todayReward || 0;
            console.log(chalk.yellow(`Rewards - Total: ${chalk.bold(totalReward)}, Today: ${chalk.bold(todayReward)}`));
        }

        return response;
    } catch (error) {
        console.error(chalk.red(`Error pinging node: ${error.message}`));
        throw error;
    }
}

// Check node status and rewards
async function checkNode(nodeId, proxy) {
    const authToken = await readAuthToken();
    const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
        "x-extension-version": "0.1.7"
    };

    const checkUrl = `${API_BASE_URL}/nodes/${nodeId}`;
    console.log(chalk.cyan(`Checking node ${nodeId} using proxy ${proxy}`));

    const options = {
        headers,
        proxy: proxy || null
    };

    try {
        const response = await cloudscraper.get(checkUrl, options);
        console.log(chalk.green(`Check node response: ${JSON.stringify(response)}`));

        // Ambil informasi reward dari respons
        if (response.rewards) {
            const totalReward = response.rewards.totalReward || 0;
            const todayReward = response.rewards.todayReward || 0;
            console.log(chalk.yellow(`Rewards - Total: ${chalk.bold(totalReward)}, Today: ${chalk.bold(todayReward)}`));
        }

        return response;
    } catch (error) {
        console.error(chalk.red(`Error checking node: ${error.message}`));
        throw error;
    }
}

// Main function to run all tasks
async function runAll() {
    try {
        console.log(chalk.blue.bold(`Starting script...`));
        useProxy = await promptUseProxy();
        console.log(chalk.blue(`useProxy: ${useProxy}`));

        const ids = await readNodeAndHardwareIds();
        console.log(chalk.blue(`Loaded ${ids.length} node IDs`));

        const proxies = await readProxies();
        console.log(chalk.blue(`Loaded ${proxies.length} proxies`));

        if (useProxy && proxies.length < ids.length) {
            throw new Error(`Number of proxies (${proxies.length}) does not match number of nodeId:hardwareId pairs (${ids.length})`);
        }

        // Loop untuk menjalankan tugas secara berkala
        while (true) {
            for (let i = 0; i < ids.length; i++) {
                const { nodeId, hardwareId } = ids[i];
                const proxy = useProxy ? proxies[i] : null;
                const ipAddress = useProxy ? await fetchIpAddress(proxy) : null;

                console.log(chalk.cyan.bold(`Processing node ${nodeId} with proxy ${proxy}`));
                await registerNode(nodeId, hardwareId, ipAddress, proxy);
                await startSession(nodeId, proxy);
                await pingNode(nodeId, proxy, ipAddress, true);
                await checkNode(nodeId, proxy);
            }

            // Tampilkan jumlah node yang diproses hari ini
            console.log(chalk.magenta.bold(`Total nodes processed today: ${nodesProcessedToday}`));

            // Tunggu 10 menit sebelum menjalankan lagi
            console.log(chalk.blue.bold(`Waiting for 10 minutes before next run...`));
            await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        }
    } catch (error) {
        console.error(chalk.red.bold(`An error occurred: ${error.message}`));
    }
}

// Run the script
runAll();

