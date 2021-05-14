
/**
 * Wait during the given time.
 * @param time Time in ms.
 */
export async function sleep(time: number) {
    return await new Promise<void>((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * Attempt a given action. Throw an error if the max number of attempt is exceeded.
 * @param maxAttempts Max number of attempts.
 * @param action Action attempted.
 * @param timeOut Time in ms between each attempt (default: 1s).
 */
export async function attemptAction( 
    action: (current: number) => Promise<void>, 
    maxAttempts: number,
    timeOut = 1000
    ) {
    for(let i= 1; i<=maxAttempts; i++) {
        try {
            await action(i);
            break;
        } catch (error) {
            if(i === maxAttempts) throw error;
            await sleep(timeOut);
        }
    }
}