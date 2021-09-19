export const fetchFromUrl = async (url: string, count: number = 100) => {
    let data = await (await fetch(`https://www.reddit.com${url}.json?limit=${count}&raw_json=1`)).json()

    return data;
}

// export const fetchFromUrl = async (url: string, count: number = 100) => {
//     let data = await (await fetch(`https://www.reddit.com${url}.json?limit=${count}&raw_json=1`, { mode: 'no-cors' })).json()

//     return data;
// }
