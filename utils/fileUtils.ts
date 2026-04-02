import fs from 'fs/promises';
import path from 'path';

/**
 * Removes all files within a specific directory without deleting the directory itself.
 * @param directoryPath - The absolute path to the directory to clean.
 */
export async function cleanDirectory(directoryPath: string): Promise<void> {
    try {
        const files = await fs.readdir(directoryPath);

        const deletePromises = files.map(file => {
            const filePath = path.join(directoryPath, file);
            return fs.unlink(filePath);
        });

        await Promise.all(deletePromises);
        console.log(`Directory cleaned: ${directoryPath}`);
    } catch (error) {
        // If the directory doesn't exist, we don't need to throw an error
        console.error("Error during directory cleanup:", error);
    }
}
