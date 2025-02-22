import { convertTimeDisplayToMinutes, convertMinutesToTimeDisplay } from "../functions"
import { MAX_MINUTES } from "../constants"

describe("convertTimeDisplayToMinutes", () => {
	it("should convert the time display to the proper amount of minutes", () => {
		expect(convertTimeDisplayToMinutes("15w 6d 02h 40m")).toBe(160000)
		expect(convertTimeDisplayToMinutes("00w 0d 00h 00m")).toBe(0)
		expect(convertTimeDisplayToMinutes("00w 0d 02h 00m")).toBe(120)
		expect(convertTimeDisplayToMinutes("00w 0d 2h 0m")).toBe(120)
		expect(convertTimeDisplayToMinutes("0w 0d 2h 0m")).toBe(120)
		expect(convertTimeDisplayToMinutes("asfdjlskjdf")).toBe(-1)
		expect(convertTimeDisplayToMinutes("99w 6d 23h 59m")).toBe(MAX_MINUTES)
	})
})

describe("convertMinutesToTimeDisplay", () => {
	it("should convert minutes to the proper time display", () => {
		expect(convertMinutesToTimeDisplay(160000)).toBe("15w 6d 2h 40m")
		expect(convertMinutesToTimeDisplay(120)).toBe("0w 0d 2h 0m")
		expect(convertMinutesToTimeDisplay(0)).toBe("0w 0d 0h 0m")
		expect(convertMinutesToTimeDisplay(MAX_MINUTES)).toBe("99w 6d 23h 59m")
		expect(convertMinutesToTimeDisplay(MAX_MINUTES + 1)).toBe("invalid")
		expect(convertMinutesToTimeDisplay(-1)).toBe("invalid")
	})
	it("if include leading zeroes, should include leading zeroes", () => {
		expect(convertMinutesToTimeDisplay(160000, true)).toBe("15w 6d 02h 40m")
		expect(convertMinutesToTimeDisplay(120, true)).toBe("00w 0d 02h 00m")
		expect(convertMinutesToTimeDisplay(0, true)).toBe("00w 0d 00h 00m")
	})
})