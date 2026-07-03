pub trait Grammar<K> {
    fn match_token(&self, slice: &str) -> Option<(K, usize)>;
    fn is_whitespace(&self, c: char) -> bool {
        c.is_whitespace()
    }
}
