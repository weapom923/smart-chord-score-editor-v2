#pragma once
#include <cstdint>
#include <cstddef>
#include <vector>
#include <ostream>

namespace scse {

    namespace waveform_decimator {
        static constexpr std::uint8_t VERSION_MAJOR = 0;
        static constexpr std::uint8_t VERSION_MINOR = 1;

        using sample_type = std::float_t;

        void generate(
            std::ostream& ostream,
            const sample_type** lpcmSamples,
            std::uint32_t numChannels,
            std::uint32_t numOriginalSamples);
    }
}
