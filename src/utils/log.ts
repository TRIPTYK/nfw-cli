/**
 * @module log
 * @description Shortcut module to log colorful text messages
 * @author Deflorenne Amaury
 */
import * as Chalk from "chalk";
import spinners from "cli-spinners";
import * as ora from "ora";

/**
 * Static logger class.
 */
export class Logger {
	private static types = {
		error: [Chalk.bold.red, "❌"],
		warning: [Chalk.yellow, "⚠"],
		success: [Chalk.green, "✔"],
		info: [Chalk.blue, "🛈"],
		debug: [Chalk.magentaBright, ""],
	} as any;

	private static loader = ora({
		spinner: spinners.arc,
		color: "magenta",
	});

	static setStream(stream: NodeJS.WritableStream) {
		this.loader = {
			...this.loader,
			...ora({
				stream,
			}),
		};
	}

	/**
	 * Error message.
	 * @param text Text to display.
	 */
	static error(text: string) {
		this.basic("error", text);
	}

	/**
	 * Warning message.
	 * @param text Text to display.
	 */
	static warning(text: string) {
		this.basic("warning", text);
	}

	/**
	 * Success message.
	 * @param text Text to display.
	 */
	static success(text: string) {
		this.basic("success", text);
	}

	/**
	 * Info message.
	 * @param text Text to display.
	 */
	static info(text: string) {
		this.basic("info", text);
	}

	/**
	 * Loading message.
	 * @param text Text to display.
	 */
	static loading(text: string) {
		if (!this.loader.isSpinning) this.loader.start(text);
		else this.loader.text = text;
	}

	/**
	 * Debug message.
	 * @param text Text to display.
	 */
	static debug(...texts: any[]) {
		this.basic("debug", texts.map(v=>(typeof v === "object")?JSON.stringify(v):v).join('\n'));
	}

	/**
	 * Basic message.
	 * @param type Type of the message.
	 * @param text Text to display.
	 */
	static basic(type: MessageType, text: string) {
		this.custom(text, this.types[type][1], this.types[type][0]);
	}

	/**
	 * Customizable message.
	 * @param text Text to display.
	 */
	static custom(text: string, symbol = "", color = Chalk.white) {
		text = color(text);
		symbol = color(symbol);
		if (this.loader.isSpinning) {
			this.loader.stopAndPersist({
				symbol,
				text,
			});
		} else console.log(`${symbol} ${text}`);
	}
}

export type MessageType = "success" | "warning" | "error" | "info" | "debug";
