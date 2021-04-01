/**
 * @module log
 * @description Shortcut module to log colorful text messages
 * @author Deflorenne Amaury
 */
import * as Chalk from "chalk";

/**
 * Static logger class.
 */
export class Logger {
	private static types = {
		error: [Chalk.bold.red, "❌"],
		warning: [Chalk.yellow, "⚠"],
		success: [Chalk.green, "✔"],
		info: [Chalk.blue, "🛈"],
	} as any;

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
		if (symbol.length) {
			console.log(`${color(symbol)}\t${color(text)}\t${color(symbol)}`);
		} else {
			console.log(`  ${text}  `);
		}
	}
}

export type MessageType = "success" | "warning" | "error" | "info";
