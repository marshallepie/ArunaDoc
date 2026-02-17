FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { "2026-02-17 09:05:08" }
  end
end
