import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Button } from "../lib/components/onboarding/Button";

Enzyme.configure({ adapter: new Adapter() });

describe("Button", () => {
	it("renders the children", () => {
		const button = shallow(<Button>foobar</Button>);
		expect(button.text()).toBe("foobar");
	});

	it("can be disabled", () => {
		const button = shallow(<Button disabled>foobar</Button>);
		expect(button.prop("disabled")).toBe(true);
	});

	describe("when loading", () => {
		it("shows a spinner and is disabled", () => {
			const button = shallow(<Button loading>foobar</Button>);
			expect(button.find(".loading").exists()).toBe(true);
			expect(button.prop("disabled")).toBe(true);
		});
	});

	it("passes extra props to button element", () => {
		const button = shallow(<Button foobarProp={true}>foobar</Button>);
		expect(button.prop("foobarProp")).toBe(true);
	});

	it("uses the className prop provided", () => {
		const button = shallow(<Button className="another-class">foobar</Button>);
		expect(button.hasClass("another-class")).toBe(true);
	});
});
