use std::ffi::c_int;

unsafe extern "C" {
    fn get_success() -> c_int;
    fn multiply_by_two(a: c_int) -> c_int;
}

pub fn call_get_success() -> i32 {
    unsafe { get_success() }
}

pub fn call_multiply_by_two(a: i32) -> i32 {
    unsafe { multiply_by_two(a) }
}
