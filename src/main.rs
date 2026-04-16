use std::ffi::c_int;

unsafe extern "C" {
    fn get_success() -> c_int;
    fn multiply_by_two(a: c_int) -> c_int;
}

fn main() {
    let number = 21;
    let result = unsafe { multiply_by_two(number) };

    println!("From C code: {number} * 2 = {result}");
    println!("From C code: get_success() => {}", unsafe { get_success() });
}
