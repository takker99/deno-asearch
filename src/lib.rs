use asearch::Asearch;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ClosureHandle(Closure<dyn FnMut(&str, u8) -> bool>);

#[wasm_bindgen]
pub fn asearch(source: &str) -> ClosureHandle {
    let asearch = Asearch::new(source);
    let cb = Closure::wrap(Box::new(move |text, ambig| {
        asearch.find(text, ambig);
    }) as Box<dyn FnMut(&str,u8) -> bool>);
    ClosureHandle(cb)
}
