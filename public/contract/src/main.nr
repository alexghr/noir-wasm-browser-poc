// A contract used for testing a random hodgepodge of small features from simulator and end-to-end tests.
contract Test {
    // use dep::aztec::oracle::debug_log::debug_log_format,
    use dep::safe_math::safe_u120::SafeU120;

    #[aztec(private)]
    fn constructor() {
      // debug_log_format("contract deployed");
      let max = SafeU120::max();
      let min = SafeU120::min();
      assert(max.eq(min) == false);
    }
}
