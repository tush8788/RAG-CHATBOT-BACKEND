const AiRetry = async (apiCallFn:any, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCallFn();
        } catch (error:any) {
            console.log("error ",error)
            if (error.message.includes("503") && i < retries - 1) {
                console.warn(`Retrying... (${i + 1}/${retries})`);
                await new Promise(res => setTimeout(res, delay * (i + 1))); // exponential backoff
            } else {
                console.warn(`Retrying...)`);
                throw error;
            }
        }
    }
}

export default AiRetry