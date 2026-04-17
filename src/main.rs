fn main() {
    let number = 21;
    let result = convertly::call_multiply_by_two(number);

    println!("From C code: {number} * 2 = {result}");
    println!(
        "From C code: get_success() => {}",
        convertly::call_get_success()
    );
}
