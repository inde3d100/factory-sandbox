import unittest

from calc import add, divide, modulo, multiply, power, subtract


class TestCalc(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

    def test_subtract(self):
        self.assertEqual(subtract(5, 3), 2)

    def test_multiply(self):
        self.assertEqual(multiply(2, 3), 6)

    def test_divide(self):
        self.assertEqual(divide(6, 3), 2)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            divide(1, 0)

    def test_power(self):
        self.assertEqual(power(2, 3), 8)

    def test_modulo(self):
        self.assertEqual(modulo(7, 3), 1)
        self.assertEqual(modulo(-7, 3), 2)

    def test_modulo_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            modulo(1, 0)


if __name__ == "__main__":
    unittest.main()
