export const fetchFromUrl = async (url: string, count: number = 100) => {
    let response = (await fetch(`https://www.reddit.com${url}.json?limit=${count}&raw_json=1`)).json();
    return response;
}