import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../contextual-controls-card.js", import.meta.url), "utf8");
const registry = new Map();
const sandbox = {
  console: { info() {} },
  navigator: { language: "en-US" },
  HTMLElement: class {},
  CustomEvent: class {},
  customElements: {
    define(name, value) { registry.set(name, value); },
    get(name) { return registry.get(name); },
  },
  window: { customCards: [], setTimeout, clearTimeout },
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const helpers = sandbox.window.ContextualControlsCardTest;
const Card = registry.get("contextual-controls-card");
const LearningCard = registry.get("contextual-controls-learning-card");

test("automatic actions remain user initiated and domain safe", () => {
  assert.deepEqual({ ...helpers.automaticAction("light.kitchen") }, { domain: "homeassistant", service: "toggle" });
  assert.deepEqual({ ...helpers.automaticAction("scene.evening") }, { domain: "scene", service: "turn_on" });
  assert.deepEqual({ ...helpers.automaticAction("button.sync") }, { domain: "button", service: "press" });
  assert.equal(helpers.automaticAction("lock.front_door"), null);
  assert.equal(helpers.automaticAction("climate.home"), null);
});

test("visual editor exposes all layouts and icon policies", () => {
  const form = Card.getConfigForm();
  const text = JSON.stringify(form.schema);
  for (const value of ["tiles", "compact", "chips", "entity", "native"]) assert.match(text, new RegExp(value));
});

test("defaults are useful without YAML", () => {
  const config = Card.getStubConfig();
  assert.equal(config.sensor, "sensor.contextual_controls");
  assert.equal(config.columns, 3);
  assert.equal(config.mobile_columns, 2);
  assert.equal(config.layout, "tiles");
  assert.equal(config.tap_action, "automatic");
});

test("card registers once and offers the sensor suggestion", () => {
  assert.ok(Card);
  assert.ok(LearningCard);
  assert.equal(sandbox.window.customCards.length, 2);
  const suggestion = sandbox.window.customCards[0].getEntitySuggestion({}, "sensor.contextual_controls");
  assert.equal(suggestion.config.type, "custom:contextual-controls-card");
  assert.equal(sandbox.window.customCards[0].getEntitySuggestion({}, "light.kitchen"), null);
});

test("learning dashboard has useful visual defaults", () => {
  const config = LearningCard.getStubConfig();
  assert.equal(config.sensor, "sensor.contextual_controls_learning");
  assert.equal(config.max_patterns, 6);
  assert.equal(config.show_comparison, true);
  assert.equal(config.show_sequences, true);
  const form = JSON.stringify(LearningCard.getConfigForm().schema);
  for (const value of [
    "max_patterns",
    "show_comparison",
    "show_transitions",
    "show_sequences",
    "show_feedback",
  ]) {
    assert.match(form, new RegExp(value));
  }
});

test("learning helpers clamp rates and format delays", () => {
  assert.equal(helpers.rateLabel(0.724), "72%");
  assert.equal(helpers.rateLabel(4), "100%");
  assert.equal(helpers.rateLabel(-1), "0%");
  assert.equal(helpers.delayLabel(45), "45s");
  assert.equal(helpers.delayLabel(600), "10m");
  assert.equal(helpers.delayLabel(5400), "1.5h");
});

test("learning sensor suggestion selects the learning card", () => {
  const registration = sandbox.window.customCards.find(
    (card) => card.type === "contextual-controls-learning-card",
  );
  const suggestion = registration.getEntitySuggestion({}, "sensor.contextual_controls_learning");
  assert.equal(suggestion.config.type, "custom:contextual-controls-learning-card");
  assert.equal(registration.getEntitySuggestion({}, "sensor.contextual_controls"), null);
});
