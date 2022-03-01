import fs from 'fs';
const dist = 'dist/'

export const clean = () => {
    if (fs.existsSync(dist)) {
        // delete directory recursively
        try {
            fs.rmSync(dist , { recursive: true });
            console.log(`${dist} is deleted!`);
        } catch (err) {
            console.error(`Error while deleting ${dist}.`);
        }
    }
}


export default {clean}

