const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

let previousDataCount = 0;

const checkNewData = async () => {
    try {
        const response = await axios.get("https://api.kontenbase.com/query/api/v1/5b34d577-94c1-4ba1-baa0-6409f9f38c34/Postingan");
        
        const newDataCount = response.data.length;
        
        if (newDataCount > previousDataCount) {
            const lastDataIndex = newDataCount - 1;
            const newDataTitle = response.data[lastDataIndex].title;
            const newDataImageUrl = response.data[lastDataIndex].images[0].url; // Assuming the API returns image URLs
            
            // Send message with image
            await axios.post(`${TELEGRAM_API}/sendPhoto`, {
                chat_id: '6244420760', // Ganti dengan ID obrolan Anda
                photo: newDataImageUrl,
                caption: `Hai, ada data baru nih! Judul: ${newDataTitle}`
            });
            previousDataCount = newDataCount;
        }
    } catch (error) {
        console.error('Error checking for new data:', error);
    }
}

const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log(res.data);
    } catch (error) {
        console.error('Error initializing webhook:', error);
    }
}

const startBot = async () => {
    try {
        await init();
        await checkNewData();

        setInterval(async () => {
            await checkNewData();
        }, 5  * 1000);
    } catch (error) {
        console.error('Error starting bot:', error);
    }
}

startBot();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
